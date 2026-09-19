using Momentum.Api.Data;
using Momentum.Api.Models;

namespace Momentum.Api.Services.PersonalModelService;

public class PersonalModelService : IPersonalModelService
{
    private readonly IRepository<BehaviorSignal> _signalRepo;
    private readonly IRepository<PersonalModel> _modelRepo;
    private readonly ILogger<PersonalModelService> _logger;

    public PersonalModelService(
        IRepository<BehaviorSignal> signalRepo,
        IRepository<PersonalModel> modelRepo,
        ILogger<PersonalModelService> logger)
    {
        _signalRepo = signalRepo;
        _modelRepo = modelRepo;
        _logger = logger;
    }

    public async Task<PersonalModel> GetOrCreateModelAsync(Guid userId)
    {
        var model = await _modelRepo.FindOneAsync(m => m.UserId == userId);
        if (model == null)
        {
            model = new PersonalModel
            {
                UserId = userId,
                UpdatedAt = DateTime.UtcNow
            };
            var signals = await _signalRepo.GetAllAsync(s => s.UserId == userId);
            model.Apply(signals);
            await _modelRepo.AddAsync(model);
        }
        return model;
    }

    public async Task<PersonalModel> RecordSignalAsync(
        Guid userId,
        Guid taskId,
        Guid planId,
        SignalType type,
        int? actualMinutes = null,
        int? estimatedMinutes = null,
        string? note = null)
    {
        var signal = new BehaviorSignal
        {
            UserId = userId,
            TaskId = taskId,
            PlanId = planId,
            Type = type,
            ActualMinutes = actualMinutes,
            EstimatedMinutes = estimatedMinutes,
            CompletionHour = DateTime.UtcNow.Hour,
            Timestamp = DateTime.UtcNow,
            Note = note
        };

        await _signalRepo.AddAsync(signal);
        _logger.LogInformation("Recorded BehaviorSignal for User {UserId}: Task {TaskId}, Type {Type}, Actual: {Actual}m, Est: {Est}m",
            userId, taskId, type, actualMinutes, estimatedMinutes);

        var allUserSignals = await _signalRepo.GetAllAsync(s => s.UserId == userId);

        var model = await _modelRepo.FindOneAsync(m => m.UserId == userId);
        if (model == null)
        {
            model = new PersonalModel { UserId = userId };
            model.Apply(allUserSignals);
            await _modelRepo.AddAsync(model);
        }
        else
        {
            model.Apply(allUserSignals);
            await _modelRepo.UpdateAsync(model.Id, model);
        }

        return model;
    }

    public async Task<List<string>> GetExplainabilityInsightsAsync(Guid userId)
    {
        var model = await GetOrCreateModelAsync(userId);
        return model.ExplainabilityStatements;
    }
}
