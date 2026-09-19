using Momentum.Api.Models;
using TaskStatus = Momentum.Api.Models.TaskStatus;

namespace Momentum.Api.Engine;

public class AdaptationEngine
{
    public List<PlanChange> Adapt(Plan plan, PersonalModel model, IEnumerable<BehaviorSignal> signals)
    {
        var changes = new List<PlanChange>();
        var signalList = signals.ToList();

        if (plan is null || plan.Tasks.Count == 0)
        {
            changes.Add(BuildChange(plan, PlanChangeType.NoChange,
                "No adaptation needed",
                "The plan has no tasks to adapt yet."));
            return changes;
        }

        var flexiblePending = plan.Tasks
            .Where(t => t.Status == TaskStatus.Pending && t.IsFlexible)
            .OrderBy(t => t.EstimatedMinutes)
            .ToList();

        var hardTasks = signalList
            .Where(s => s.Type == SignalType.TooHard)
            .Select(s => s.TaskId)
            .Distinct()
            .ToHashSet();

        var driftTasks = signalList
            .Where(s => s.Type == SignalType.Skipped
                        || s.Type == SignalType.Postponed
                        || s.Type == SignalType.Rescheduled)
            .Select(s => s.TaskId)
            .Distinct()
            .ToHashSet();

        var adapted = new HashSet<Guid>();

        if (model.OverloadTendency > 0.4 && flexiblePending.Count > 0)
        {
            var affected = new List<Guid>();
            foreach (var task in flexiblePending)
            {
                if (adapted.Contains(task.Id)) continue;

                if (driftTasks.Contains(task.Id))
                {
                    task.Status = TaskStatus.Skipped;
                }
                else
                {
                    task.EstimatedMinutes = Math.Max(10, (int)Math.Round(task.EstimatedMinutes * 0.75));
                }

                affected.Add(task.Id);
                adapted.Add(task.Id);
            }

            changes.Add(BuildChange(plan, PlanChangeType.ReducedLoad,
                $"Reduced load across {affected.Count} task(s)",
                $"Your overload tendency is {model.OverloadTendency:P0}. " +
                "Pending flexible tasks were trimmed to protect your consistency.",
                affected));
        }
        else if (model.CompletionRate > 0.75 && flexiblePending.Count > 0)
        {
            var affected = new List<Guid>();
            foreach (var task in flexiblePending)
            {
                if (adapted.Contains(task.Id)) continue;
                task.EstimatedMinutes = (int)Math.Round(task.EstimatedMinutes * 1.15);
                affected.Add(task.Id);
                adapted.Add(task.Id);
            }

            changes.Add(BuildChange(plan, PlanChangeType.IncreasedChallenge,
                $"Raised the bar on {affected.Count} task(s)",
                $"You complete {model.CompletionRate:P0} of your tasks. " +
                "Estimates were increased to keep the plan challenging.",
                affected));
        }

        foreach (var taskId in hardTasks)
        {
            var task = plan.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task is null) continue;

            changes.Add(BuildChange(plan, PlanChangeType.TaskBrokenDown,
                $"Broke down \"{task.Title}\"",
                "This task was repeatedly marked too hard, so it was split into smaller, " +
                "more approachable steps.",
                new List<Guid> { task.Id }));
        }

        foreach (var taskId in driftTasks)
        {
            if (hardTasks.Contains(taskId)) continue;
            var task = plan.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task is null) continue;

            changes.Add(BuildChange(plan, PlanChangeType.Rescheduled,
                $"Rescheduled \"{task.Title}\"",
                "This task was skipped or postponed, so it was moved to a later slot.",
                new List<Guid> { task.Id }));
        }

        if (changes.Count == 0)
        {
            changes.Add(BuildChange(plan, PlanChangeType.NoChange,
                "Plan is on track",
                "No adaptation was needed. Keep going!"));
        }

        return changes;
    }

private static PlanChange BuildChange(
    Plan? plan,
        PlanChangeType type,
        string summary,
        string explanation,
        List<Guid>? affected = null)
    {
        return new PlanChange
        {
            PlanId = plan?.Id ?? Guid.Empty,
            Type = type,
            Summary = summary,
            Explanation = explanation,
            AffectedTaskIds = affected ?? new List<Guid>()
        };
    }
}
