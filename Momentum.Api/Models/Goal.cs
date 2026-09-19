using MongoDB.Bson.Serialization.Attributes;

namespace Momentum.Api.Models;

public enum GoalPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}

public class Goal
{
    [BsonId]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? TargetDate { get; set; }
    public GoalPriority Priority { get; set; } = GoalPriority.Medium;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
