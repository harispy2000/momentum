using MongoDB.Bson.Serialization.Attributes;

namespace Momentum.Api.Models;

public class Plan
{
    [BsonId]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GoalId { get; set; }
    public Guid UserId { get; set; }
    public string Summary { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<PlanTask> Tasks { get; set; } = new();
}
