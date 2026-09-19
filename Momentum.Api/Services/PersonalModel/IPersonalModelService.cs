using Momentum.Api.Models;

namespace Momentum.Api.Services.PersonalModelService;

public interface IPersonalModelService
{
    Task<PersonalModel> GetOrCreateModelAsync(Guid userId);
    Task<PersonalModel> RecordSignalAsync(Guid userId, Guid taskId, Guid planId, SignalType type, int? actualMinutes = null, int? estimatedMinutes = null, string? note = null);
    Task<List<string>> GetExplainabilityInsightsAsync(Guid userId);
}
