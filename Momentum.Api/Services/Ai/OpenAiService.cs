using System.Text.Json;
using Microsoft.Extensions.Options;
using Momentum.Api.Models;

namespace Momentum.Api.Services.Ai;

public class OpenAiOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4o-mini";
    public string BaseUrl { get; set; } = "https://api.openai.com/v1";
}

public class OpenAiService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly OpenAiOptions _options;
    private readonly ILogger<OpenAiService> _logger;

    public OpenAiService(HttpClient httpClient, IOptions<OpenAiOptions> options, ILogger<OpenAiService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<GeneratedPlanResult> GeneratePlanAsync(Goal goal, PersonalModel? personalModel = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating AI plan for goal '{Title}' (Priority: {Priority})", goal.Title, goal.Priority);

        var prompt = BuildPrompt(goal, personalModel);

        var request = new
        {
            model = _options.Model,
            messages = new[]
            {
                new { role = "system", content = GetSystemPrompt() },
                new { role = "user", content = prompt }
            },
            temperature = 0.7,
            max_tokens = 2000,
            response_format = new { type = "json_object" }
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var response = await _httpClient.PostAsync($"{_options.BaseUrl}/chat/completions", content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        var result = ParseResponse(responseJson, goal, personalModel);

        return result;
    }

    private string GetSystemPrompt()
    {
        return @"You are an expert productivity coach and planning assistant. Generate personalized, actionable execution plans based on user goals.

Return ONLY valid JSON in this exact format:
{
  ""summary"": ""Brief 1-2 sentence summary of the plan"",
  ""tasks"": [
    {
      ""title"": ""Specific, actionable task title"",
      ""description"": ""Detailed description of what to do and why"",
      ""estimatedMinutes"": 45,
      ""category"": ""planning|execution|review|delivery"",
      ""dayOffset"": 0
    }
  ]
}

Guidelines:
- Generate 4-7 tasks depending on goal complexity
- Make tasks specific to the user's actual goal (not generic templates)
- Use realistic time estimates (20-120 minutes per task)
- Spread dayOffset logically (0, 1, 2, 3, etc.)
- Categories: planning, execution, review, delivery, learning, practice, research, testing
- Tasks should build on each other logically
- Consider the user's personal model if provided (adapt session length, difficulty, focus areas)";
    }

    private string BuildPrompt(Goal goal, PersonalModel? personalModel)
    {
        var prompt = $@"Goal: {goal.Title}
Description: {goal.Description}
Priority: {goal.Priority}
Target Date: {(goal.TargetDate.HasValue ? goal.TargetDate.Value.ToString("yyyy-MM-dd") : "Not specified")}";

        if (personalModel != null)
        {
            prompt += $@"

Personal Context:
- Average Session Duration: {personalModel.AverageSessionMinutes?.ToString() ?? "Unknown"} minutes
- Estimate Accuracy: {personalModel.AverageEstimateAccuracy?.ToString() ?? "Unknown"}
- Preferred Productive Periods: {(personalModel.PreferredProductivePeriods?.Any() == true ? string.Join(", ", personalModel.PreferredProductivePeriods) : "None specified")}
- Completion Rate: {personalModel.CompletionRate:P0}
- Total Tasks Tracked: {personalModel.TotalSignals}";
        }

        prompt += @"

Generate a personalized, step-by-step execution plan tailored to this specific goal and user context. Make tasks specific and actionable.";

        return prompt;
    }

    private GeneratedPlanResult ParseResponse(string json, Goal goal, PersonalModel? personalModel)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var content = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(content))
            {
                throw new InvalidOperationException("Empty response from OpenAI");
            }

            var plan = JsonSerializer.Deserialize<GeneratedPlanResult>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (plan?.Tasks == null || plan.Tasks.Count == 0)
            {
                throw new InvalidOperationException("No tasks generated");
            }

            // Clamp estimates and ensure dayOffset progression
            var targetSession = personalModel?.AverageSessionMinutes.HasValue == true
                ? (int)Math.Clamp(personalModel.AverageSessionMinutes.Value, 25, 90)
                : 45;

            for (int i = 0; i < plan.Tasks.Count; i++)
            {
                var task = plan.Tasks[i];
                task.EstimatedMinutes = Math.Clamp(task.EstimatedMinutes, 20, 120);
                task.DayOffset = Math.Max(task.DayOffset, i > 0 ? plan.Tasks[i - 1].DayOffset : 0);
            }

            plan.Summary ??= $"Generated {plan.Tasks.Count}-step personalized plan for '{goal.Title}'.";
            return plan;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse OpenAI response, falling back to heuristic");
            return GenerateFallbackPlan(goal, personalModel);
        }
    }

    private GeneratedPlanResult GenerateFallbackPlan(Goal goal, PersonalModel? personalModel)
    {
        var targetSession = personalModel?.AverageSessionMinutes.HasValue == true
            ? (int)Math.Clamp(personalModel.AverageSessionMinutes.Value, 25, 90)
            : 45;

        var blueprint = new[]
        {
            ($"Plan & Scope: {goal.Title}", $"Break down '{goal.Title}' into concrete milestones and success criteria.", 1, "planning", 0),
            ("First Execution Sprint", "Tackle the most critical high-leverage deliverable first.", 2, "execution", 1),
            ("Midpoint Review & Iterate", "Review progress, identify roadblocks, and adjust approach.", 1, "review", 2),
            ("Final Delivery & Verification", "Complete remaining tasks and verify against original goal.", 1, "delivery", 3)
        };

        var tasks = blueprint.Select((b, i) => new GeneratedTaskItem
        {
            Title = b.Item1,
            Description = b.Item2,
            EstimatedMinutes = Math.Clamp(targetSession * b.Item3, 20, 120),
            Category = b.Item4,
            DayOffset = b.Item5
        }).ToList();

        return new GeneratedPlanResult
        {
            Summary = $"Generated {tasks.Count}-step fallback plan for '{goal.Title}'.",
            Tasks = tasks
        };
    }
}