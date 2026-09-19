namespace Momentum.Api.Models;

public enum PlanChangeType
{
    ReducedLoad,
    IncreasedChallenge,
    Rescheduled,
    TaskBrokenDown,
    PlanCreated,
    NoChange
}

public class PlanChange
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlanId { get; set; }
    public PlanChangeType Type { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<Guid> AffectedTaskIds { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
