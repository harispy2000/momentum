using Momentum.Api.Models;

namespace Momentum.Api.Services.Ai;

public class GeneratedTaskItem
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public string Category { get; set; } = "core";
    public int DayOffset { get; set; }
}

public class GeneratedPlanResult
{
    public string Summary { get; set; } = string.Empty;
    public List<GeneratedTaskItem> Tasks { get; set; } = new();
}

public interface IAIService
{
    Task<GeneratedPlanResult> GeneratePlanAsync(Goal goal, PersonalModel? personalModel = null, CancellationToken cancellationToken = default);
}
