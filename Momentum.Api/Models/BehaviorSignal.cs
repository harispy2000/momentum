using MongoDB.Bson.Serialization.Attributes;

namespace Momentum.Api.Models;

public enum SignalType
{
    Completed = 0,
    Skipped = 1,
    Delayed = 2,
    Rescheduled = 3,
    TooHard = 4,
    TooEasy = 5,
    Postponed = 6
}

public class BehaviorSignal
{
    [BsonId]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid TaskId { get; set; }
    public Guid PlanId { get; set; }
    public SignalType Type { get; set; }
    public int? EstimatedMinutes { get; set; }
    public int? ActualMinutes { get; set; }
    public int? DurationDeltaMinutes => (ActualMinutes.HasValue && EstimatedMinutes.HasValue)
        ? ActualMinutes.Value - EstimatedMinutes.Value
        : null;
    public int CompletionHour { get; set; }
    public string? Note { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
