using MongoDB.Bson.Serialization.Attributes;

namespace Momentum.Api.Models;

public enum TaskStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Skipped = 3
}

public class PlanTask
{
    [BsonId]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PlanId { get; set; }
    public Guid UserId { get; set; }
    public Guid GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public int? ActualMinutes { get; set; }
    public DateTime ScheduledDate { get; set; } = DateTime.UtcNow.Date;
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public DateTime? CompletedAt { get; set; }
    public int Order { get; set; }
    public string Category { get; set; } = "general";
    public bool IsFlexible { get; set; } = true;
}
