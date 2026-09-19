using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MongoDB.Driver;
using Momentum.Api.Data;
using Momentum.Api.Models;
using Momentum.Api.Services.Ai;
using Momentum.Api.Services.Auth;
using Momentum.Api.Services.PersonalModelService;
using TaskStatus = Momentum.Api.Models.TaskStatus;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var config = builder.Configuration;
var jwtSecretKey = config["Jwt:SecretKey"] ?? "Momentum_Hackathon_Secret_Key_For_Review_1_Must_Be_32_Chars_Long!";
var jwtIssuer = config["Jwt:Issuer"] ?? "MomentumApi";
var jwtAudience = config["Jwt:Audience"] ?? "MomentumWeb";

// MongoDB Database initialization (resilient: null if not configured or unreachable)
var mongoConnString = Environment.GetEnvironmentVariable("MONGODB_URI")
    ?? config["MongoDb:ConnectionString"];
var mongoDbName = config["MongoDb:DatabaseName"] ?? "MomentumDb";

IMongoDatabase? mongoDatabase = null;
if (!string.IsNullOrWhiteSpace(mongoConnString))
{
    try
    {
        var mongoClient = new MongoClient(mongoConnString);
        mongoDatabase = mongoClient.GetDatabase(mongoDbName);
        Console.WriteLine($"[Storage] Connected to MongoDB Atlas database: {mongoDbName}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Storage] Warning: Failed to connect to MongoDB ({ex.Message}). Using resilient in-memory store.");
    }
}
else
{
    Console.WriteLine("[Storage] No MONGODB_URI provided. Running in high-performance in-memory repository mode.");
}

// Register Repositories
builder.Services.AddSingleton<IRepository<User>>(sp =>
    new MongoRepository<User>(mongoDatabase, "users", sp.GetRequiredService<ILogger<MongoRepository<User>>>()));

builder.Services.AddSingleton<IRepository<Goal>>(sp =>
    new MongoRepository<Goal>(mongoDatabase, "goals", sp.GetRequiredService<ILogger<MongoRepository<Goal>>>()));

builder.Services.AddSingleton<IRepository<Plan>>(sp =>
    new MongoRepository<Plan>(mongoDatabase, "plans", sp.GetRequiredService<ILogger<MongoRepository<Plan>>>()));

builder.Services.AddSingleton<IRepository<PlanTask>>(sp =>
    new MongoRepository<PlanTask>(mongoDatabase, "tasks", sp.GetRequiredService<ILogger<MongoRepository<PlanTask>>>()));

builder.Services.AddSingleton<IRepository<BehaviorSignal>>(sp =>
    new MongoRepository<BehaviorSignal>(mongoDatabase, "signals", sp.GetRequiredService<ILogger<MongoRepository<BehaviorSignal>>>()));

builder.Services.AddSingleton<IRepository<PersonalModel>>(sp =>
    new MongoRepository<PersonalModel>(mongoDatabase, "personal_models", sp.GetRequiredService<ILogger<MongoRepository<PersonalModel>>>()));

// Core Services
builder.Services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IAIService, HeuristicAiService>();
builder.Services.AddSingleton<IPersonalModelService, PersonalModelService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Authentication & JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Momentum API",
        Version = "v1",
        Description = "Adaptive execution and momentum intelligence API"
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
});

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Momentum API v1"));
}

// Helpers
static Guid GetCurrentUserId(ClaimsPrincipal user)
{
    var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
}

// Health Check
app.MapGet("/", () => Results.Ok(new
{
    service = "Momentum API",
    status = "running",
    version = "1.0-review1",
    timestamp = DateTime.UtcNow
}));

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================
var auth = app.MapGroup("/api/auth").WithTags("Authentication");

auth.MapPost("/register", async (RegisterRequest req, IRepository<User> userRepo, IPasswordHasher hasher, IJwtService jwt) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
    {
        return Results.BadRequest(new { message = "Email and password are required." });
    }

    var normalizedEmail = req.Email.Trim().ToLowerInvariant();
    var existing = await userRepo.FindOneAsync(u => u.Email == normalizedEmail);
    if (existing != null)
    {
        return Results.Conflict(new { message = "An account with this email already exists." });
    }

    var user = new User
    {
        Id = Guid.NewGuid(),
        Email = normalizedEmail,
        FullName = string.IsNullOrWhiteSpace(req.FullName) ? normalizedEmail.Split('@')[0] : req.FullName.Trim(),
        PasswordHash = hasher.HashPassword(req.Password),
        CreatedAt = DateTime.UtcNow
    };

    await userRepo.AddAsync(user);
    var token = jwt.GenerateToken(user);

    return Results.Ok(new AuthResponse(
        token,
        new UserDto(user.Id, user.Email, user.FullName, user.CreatedAt)
    ));
});

auth.MapPost("/login", async (LoginRequest req, IRepository<User> userRepo, IPasswordHasher hasher, IJwtService jwt) =>
{
    if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
    {
        return Results.BadRequest(new { message = "Email and password are required." });
    }

    var normalizedEmail = req.Email.Trim().ToLowerInvariant();
    var user = await userRepo.FindOneAsync(u => u.Email == normalizedEmail);
    if (user == null || !hasher.VerifyPassword(req.Password, user.PasswordHash))
    {
        return Results.Json(new { message = "Invalid email or password." }, statusCode: StatusCodes.Status401Unauthorized);
    }

    var token = jwt.GenerateToken(user);
    return Results.Ok(new AuthResponse(
        token,
        new UserDto(user.Id, user.Email, user.FullName, user.CreatedAt)
    ));
});

auth.MapGet("/me", async (ClaimsPrincipal userPrincipal, IRepository<User> userRepo) =>
{
    var userId = GetCurrentUserId(userPrincipal);
    if (userId == Guid.Empty) return Results.Unauthorized();

    var user = await userRepo.GetByIdAsync(userId);
    if (user == null) return Results.NotFound();

    return Results.Ok(new UserDto(user.Id, user.Email, user.FullName, user.CreatedAt));
}).RequireAuthorization();

// ==========================================
// 2. GOALS ENDPOINTS
// ==========================================
var goals = app.MapGroup("/api/goals").WithTags("Goals").RequireAuthorization();

goals.MapGet("/", async (ClaimsPrincipal user, IRepository<Goal> goalRepo) =>
{
    var userId = GetCurrentUserId(user);
    var userGoals = await goalRepo.GetAllAsync(g => g.UserId == userId);
    return Results.Ok(userGoals.OrderByDescending(g => g.CreatedAt));
});

goals.MapPost("/", async (CreateGoalDto input, ClaimsPrincipal user, IRepository<Goal> goalRepo) =>
{
    if (string.IsNullOrWhiteSpace(input.Title))
    {
        return Results.BadRequest(new { message = "Goal title is required." });
    }

    var userId = GetCurrentUserId(user);
    var goal = new Goal
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Title = input.Title.Trim(),
        Description = input.Description?.Trim() ?? string.Empty,
        TargetDate = input.TargetDate,
        Priority = input.Priority,
        CreatedAt = DateTime.UtcNow
    };

    await goalRepo.AddAsync(goal);
    return Results.Created($"/api/goals/{goal.Id}", goal);
});

goals.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal user, IRepository<Goal> goalRepo) =>
{
    var userId = GetCurrentUserId(user);
    var goal = await goalRepo.GetByIdAsync(id);
    if (goal == null || goal.UserId != userId)
    {
        return Results.NotFound();
    }
    return Results.Ok(goal);
});

goals.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal user, IRepository<Goal> goalRepo, IRepository<Plan> planRepo, IRepository<PlanTask> taskRepo) =>
{
    var userId = GetCurrentUserId(user);
    var goal = await goalRepo.GetByIdAsync(id);
    if (goal == null || goal.UserId != userId)
    {
        return Results.NotFound();
    }

    await goalRepo.DeleteAsync(id);
    var associatedPlans = await planRepo.GetAllAsync(p => p.GoalId == id);
    foreach (var plan in associatedPlans)
    {
        await planRepo.DeleteAsync(plan.Id);
    }
    var associatedTasks = await taskRepo.GetAllAsync(t => t.GoalId == id);
    foreach (var task in associatedTasks)
    {
        await taskRepo.DeleteAsync(task.Id);
    }

    return Results.NoContent();
});

// ==========================================
// 3. AI PLAN GENERATION ENDPOINTS
// ==========================================
goals.MapPost("/{id:guid}/plan", async (
    Guid id,
    ClaimsPrincipal user,
    IRepository<Goal> goalRepo,
    IRepository<Plan> planRepo,
    IRepository<PlanTask> taskRepo,
    IAIService aiService,
    IPersonalModelService modelService) =>
{
    var userId = GetCurrentUserId(user);
    var goal = await goalRepo.GetByIdAsync(id);
    if (goal == null || goal.UserId != userId)
    {
        return Results.NotFound(new { message = "Goal not found." });
    }

    var personalModel = await modelService.GetOrCreateModelAsync(userId);
    var planResult = await aiService.GeneratePlanAsync(goal, personalModel);

    var plan = new Plan
    {
        Id = Guid.NewGuid(),
        GoalId = goal.Id,
        UserId = userId,
        Summary = planResult.Summary,
        CreatedAt = DateTime.UtcNow
    };

    var taskEntities = new List<PlanTask>();
    for (var i = 0; i < planResult.Tasks.Count; i++)
    {
        var item = planResult.Tasks[i];
        var scheduledDate = DateTime.UtcNow.Date.AddDays(item.DayOffset);

        var taskEntity = new PlanTask
        {
            Id = Guid.NewGuid(),
            PlanId = plan.Id,
            UserId = userId,
            GoalId = goal.Id,
            Title = item.Title,
            Description = item.Description,
            EstimatedMinutes = item.EstimatedMinutes,
            ScheduledDate = scheduledDate,
            Status = TaskStatus.Pending,
            Order = i + 1,
            Category = item.Category,
            IsFlexible = true
        };

        taskEntities.Add(taskEntity);
        await taskRepo.AddAsync(taskEntity);
    }

    plan.Tasks = taskEntities;
    await planRepo.AddAsync(plan);

    return Results.Created($"/api/plans/{plan.Id}", plan);
});

var plans = app.MapGroup("/api/plans").WithTags("Plans").RequireAuthorization();

plans.MapGet("/active", async (ClaimsPrincipal user, IRepository<Plan> planRepo, IRepository<PlanTask> taskRepo) =>
{
    var userId = GetCurrentUserId(user);
    var userPlans = await planRepo.GetAllAsync(p => p.UserId == userId);
    var userTasks = await taskRepo.GetAllAsync(t => t.UserId == userId);

    foreach (var p in userPlans)
    {
        p.Tasks = userTasks.Where(t => t.PlanId == p.Id).OrderBy(t => t.Order).ToList();
    }

    return Results.Ok(userPlans.OrderByDescending(p => p.CreatedAt));
});

plans.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal user, IRepository<Plan> planRepo, IRepository<PlanTask> taskRepo) =>
{
    var userId = GetCurrentUserId(user);
    var plan = await planRepo.GetByIdAsync(id);
    if (plan == null || plan.UserId != userId)
    {
        return Results.NotFound();
    }

    var tasks = await taskRepo.GetAllAsync(t => t.PlanId == plan.Id);
    plan.Tasks = tasks.OrderBy(t => t.Order).ToList();

    return Results.Ok(plan);
});

// ==========================================
// 4. TASK MANAGEMENT & BEHAVIOR TRACKING
// ==========================================
var tasks = app.MapGroup("/api/tasks").WithTags("Tasks").RequireAuthorization();

tasks.MapGet("/today", async (ClaimsPrincipal user, IRepository<PlanTask> taskRepo) =>
{
    var userId = GetCurrentUserId(user);
    var allTasks = await taskRepo.GetAllAsync(t => t.UserId == userId);

    var today = DateTime.UtcNow.Date;
    // Show tasks scheduled for today or earlier (pending), or completed today
    var todaysTasks = allTasks
        .Where(t => t.ScheduledDate <= today || (t.CompletedAt.HasValue && t.CompletedAt.Value.Date == today))
        .OrderBy(t => t.Status == TaskStatus.Completed)
        .ThenBy(t => t.ScheduledDate)
        .ThenBy(t => t.Order)
        .ToList();

    return Results.Ok(todaysTasks);
});

tasks.MapGet("/", async (ClaimsPrincipal user, IRepository<PlanTask> taskRepo) =>
{
    var userId = GetCurrentUserId(user);
    var allTasks = await taskRepo.GetAllAsync(t => t.UserId == userId);
    return Results.Ok(allTasks.OrderBy(t => t.ScheduledDate).ThenBy(t => t.Order));
});

tasks.MapPatch("/{id:guid}/complete", async (
    Guid id,
    CompleteTaskDto body,
    ClaimsPrincipal user,
    IRepository<PlanTask> taskRepo,
    IPersonalModelService modelService) =>
{
    var userId = GetCurrentUserId(user);
    var task = await taskRepo.GetByIdAsync(id);
    if (task == null || task.UserId != userId)
    {
        return Results.NotFound(new { message = "Task not found." });
    }

    task.Status = TaskStatus.Completed;
    task.CompletedAt = DateTime.UtcNow;
    task.ActualMinutes = body.ActualMinutes ?? task.EstimatedMinutes;
    await taskRepo.UpdateAsync(task.Id, task);

    // Record Behavior Signal and update Personal Model
    var updatedModel = await modelService.RecordSignalAsync(
        userId,
        task.Id,
        task.PlanId,
        SignalType.Completed,
        task.ActualMinutes,
        task.EstimatedMinutes,
        body.Note
    );

    return Results.Ok(new
    {
        task,
        personalModel = updatedModel,
        message = "Task completed and behavior signal recorded."
    });
});

tasks.MapPatch("/{id:guid}/skip", async (
    Guid id,
    SkipTaskDto body,
    ClaimsPrincipal user,
    IRepository<PlanTask> taskRepo,
    IPersonalModelService modelService) =>
{
    var userId = GetCurrentUserId(user);
    var task = await taskRepo.GetByIdAsync(id);
    if (task == null || task.UserId != userId)
    {
        return Results.NotFound(new { message = "Task not found." });
    }

    task.Status = TaskStatus.Skipped;
    await taskRepo.UpdateAsync(task.Id, task);

    var updatedModel = await modelService.RecordSignalAsync(
        userId,
        task.Id,
        task.PlanId,
        SignalType.Skipped,
        null,
        task.EstimatedMinutes,
        body.Note
    );

    return Results.Ok(new
    {
        task,
        personalModel = updatedModel,
        message = "Task marked as skipped and signal recorded."
    });
});

// ==========================================
// 5. PERSONAL MODEL & EXPLAINABILITY
// ==========================================
var modelGroup = app.MapGroup("/api/model").WithTags("PersonalModel").RequireAuthorization();

modelGroup.MapGet("/", async (ClaimsPrincipal user, IPersonalModelService modelService) =>
{
    var userId = GetCurrentUserId(user);
    var model = await modelService.GetOrCreateModelAsync(userId);
    return Results.Ok(model);
});

modelGroup.MapGet("/insights", async (ClaimsPrincipal user, IPersonalModelService modelService) =>
{
    var userId = GetCurrentUserId(user);
    var insights = await modelService.GetExplainabilityInsightsAsync(userId);
    return Results.Ok(new { insights });
});

app.Run();

// Request & Response Records
public record RegisterRequest(string Email, string Password, string? FullName);
public record LoginRequest(string Email, string Password);
public record UserDto(Guid Id, string Email, string FullName, DateTime CreatedAt);
public record AuthResponse(string Token, UserDto User);
public record CreateGoalDto(string Title, string? Description, DateTime? TargetDate, GoalPriority Priority);
public record CompleteTaskDto(int? ActualMinutes, string? Note);
public record SkipTaskDto(string? Note);