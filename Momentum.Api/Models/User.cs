using MongoDB.Bson.Serialization.Attributes;

namespace Momentum.Api.Models;

public class User
{
    [BsonId]
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Extended profile fields
    public string? Profession { get; set; }
    public string? Timezone { get; set; }
    public string? SkillLevel { get; set; }
    public string? Bio { get; set; }
    public List<string> PreferredTools { get; set; } = [];
}
