using Microsoft.Extensions.Logging.Abstractions;
using Momentum.Api.Models;
using Momentum.Api.Services.Ai;
using Xunit;

namespace Momentum.Tests;

public class HeuristicAiServiceTests
{
    [Fact]
    public async Task GeneratePlanAsync_CreatesRealisticPlanForSoftwareGoal()
    {
        var service = new HeuristicAiService(NullLogger<HeuristicAiService>.Instance);
        var goal = new Goal
        {
            Id = Guid.NewGuid(),
            Title = "Build Hackathon MVP",
            Description = "Create full-stack product for demo",
            Priority = GoalPriority.High,
            TargetDate = DateTime.UtcNow.AddDays(3)
        };

        var result = await service.GeneratePlanAsync(goal);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Tasks);
        Assert.Contains("Plan", result.Summary, StringComparison.OrdinalIgnoreCase);
        Assert.All(result.Tasks, t =>
        {
            Assert.False(string.IsNullOrWhiteSpace(t.Title));
            Assert.True(t.EstimatedMinutes > 0);
            Assert.True(t.DayOffset >= 0);
        });
    }

    [Fact]
    public async Task GeneratePlanAsync_CalibratesToUserAverageSessionDuration()
    {
        var service = new HeuristicAiService(NullLogger<HeuristicAiService>.Instance);
        var goal = new Goal
        {
            Id = Guid.NewGuid(),
            Title = "Master Algorithms and Data Structures",
            Description = "Study graph algorithms and dynamic programming",
            Priority = GoalPriority.Medium
        };

        var personalModel = new PersonalModel
        {
            AverageSessionMinutes = 30
        };

        var result = await service.GeneratePlanAsync(goal, personalModel);

        Assert.NotNull(result);
        Assert.NotEmpty(result.Tasks);
        Assert.Contains("30m", result.Summary);
    }
}
