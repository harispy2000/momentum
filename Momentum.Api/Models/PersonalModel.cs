using MongoDB.Bson.Serialization.Attributes;

namespace Momentum.Api.Models;

public class PersonalModel
{
    [BsonId]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public int TotalSignals { get; set; }
    public int CompletedCount { get; set; }
    public int SkippedCount { get; set; }
    public int DelayedCount { get; set; }
    public int TooHardCount { get; set; }
    public int TooEasyCount { get; set; }

    public double CompletionRate =>
        (CompletedCount + SkippedCount) == 0
            ? 0
            : Math.Round((double)CompletedCount / (CompletedCount + SkippedCount), 2);

    public double? AverageSessionMinutes { get; set; }
    public double? AverageEstimateAccuracy { get; set; }
    public double OverloadTendency =>
        TotalSignals == 0 ? 0 : Math.Round((double)(TooHardCount + DelayedCount + SkippedCount) / TotalSignals, 2);

    public List<string> PreferredProductivePeriods { get; set; } = new();
    public Dictionary<string, int> PeriodCounts { get; set; } = new();
    public List<string> ExplainabilityStatements { get; set; } = new();
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public void Apply(IEnumerable<BehaviorSignal> signals)
    {
        var list = signals.ToList();
        TotalSignals = list.Count;
        CompletedCount = list.Count(s => s.Type == SignalType.Completed);
        SkippedCount = list.Count(s => s.Type == SignalType.Skipped);
        DelayedCount = list.Count(s => s.Type == SignalType.Delayed || s.Type == SignalType.Postponed);
        TooHardCount = list.Count(s => s.Type == SignalType.TooHard);
        TooEasyCount = list.Count(s => s.Type == SignalType.TooEasy);

        var completedWithDuration = list
            .Where(s => s.Type == SignalType.Completed && s.ActualMinutes.HasValue && s.ActualMinutes.Value > 0)
            .ToList();

        if (completedWithDuration.Count > 0)
        {
            AverageSessionMinutes = Math.Round(completedWithDuration.Average(s => s.ActualMinutes!.Value), 1);

            var withEstimates = completedWithDuration
                .Where(s => s.EstimatedMinutes.HasValue && s.EstimatedMinutes.Value > 0)
                .ToList();

            if (withEstimates.Count > 0)
            {
                var ratios = withEstimates.Select(s => (double)s.ActualMinutes!.Value / s.EstimatedMinutes!.Value);
                AverageEstimateAccuracy = Math.Round(ratios.Average(), 2);
            }
        }
        else
        {
            AverageSessionMinutes = null;
            AverageEstimateAccuracy = null;
        }

        // Compute preferred productive periods from actual completion timestamps
        var completedSignals = list.Where(s => s.Type == SignalType.Completed).ToList();
        var periods = new Dictionary<string, int>
        {
            ["Morning (6 AM - 12 PM)"] = 0,
            ["Afternoon (12 PM - 6 PM)"] = 0,
            ["Evening (6 PM - 12 AM)"] = 0,
            ["Night (12 AM - 6 AM)"] = 0
        };

        foreach (var signal in completedSignals)
        {
            var hour = signal.CompletionHour >= 0 && signal.CompletionHour < 24
                ? signal.CompletionHour
                : signal.Timestamp.Hour;

            if (hour >= 6 && hour < 12) periods["Morning (6 AM - 12 PM)"]++;
            else if (hour >= 12 && hour < 18) periods["Afternoon (12 PM - 6 PM)"]++;
            else if (hour >= 18 && hour < 24) periods["Evening (6 PM - 12 AM)"]++;
            else periods["Night (12 AM - 6 AM)"]++;
        }

        PeriodCounts = periods;
        var topPeriods = periods.Where(p => p.Value > 0).OrderByDescending(p => p.Value).Select(p => p.Key).ToList();
        PreferredProductivePeriods = topPeriods;

        // Formulate honest explainability statements
        ExplainabilityStatements = BuildExplainabilityStatements(list, completedSignals, periods);

        UpdatedAt = DateTime.UtcNow;
    }

    private List<string> BuildExplainabilityStatements(
        List<BehaviorSignal> allSignals,
        List<BehaviorSignal> completedSignals,
        Dictionary<string, int> periods)
    {
        var statements = new List<string>();

        if (allSignals.Count == 0)
        {
            statements.Add("Momentum is ready to learn your work patterns as you complete tasks.");
            return statements;
        }

        statements.Add($"Momentum is learning your work patterns based on {allSignals.Count} recorded behavioral interaction(s).");

        if (completedSignals.Count > 0)
        {
            var topPeriod = periods.OrderByDescending(p => p.Value).FirstOrDefault(p => p.Value > 0);
            if (!string.IsNullOrEmpty(topPeriod.Key))
            {
                statements.Add($"Your most productive window is {topPeriod.Key} ({topPeriod.Value} task{(topPeriod.Value > 1 ? "s" : "")} completed).");
            }

            if (AverageSessionMinutes.HasValue)
            {
                statements.Add($"Your average completed task session duration is {AverageSessionMinutes.Value:F0} minutes.");
            }

            if (AverageEstimateAccuracy.HasValue)
            {
                if (AverageEstimateAccuracy.Value < 0.9)
                {
                    var pct = (int)Math.Round((1.0 - AverageEstimateAccuracy.Value) * 100);
                    statements.Add($"You are completing tasks approximately {pct}% faster than initial estimates.");
                }
                else if (AverageEstimateAccuracy.Value > 1.1)
                {
                    var pct = (int)Math.Round((AverageEstimateAccuracy.Value - 1.0) * 100);
                    statements.Add($"Your tasks take approximately {pct}% longer than initial estimates, which Momentum will factor into future planning.");
                }
                else
                {
                    statements.Add("Your actual task durations closely align with initial estimates (within 10%).");
                }
            }
        }

        if (SkippedCount > 0)
        {
            statements.Add($"You have skipped {SkippedCount} task(s). Future plans will offer lighter scoping if task drift increases.");
        }

        return statements;
    }
}
