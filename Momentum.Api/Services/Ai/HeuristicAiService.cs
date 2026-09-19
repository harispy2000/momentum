using Momentum.Api.Models;

namespace Momentum.Api.Services.Ai;

public class HeuristicAiService : IAIService
{
    private readonly ILogger<HeuristicAiService> _logger;

    public HeuristicAiService(ILogger<HeuristicAiService> logger)
    {
        _logger = logger;
    }

    public Task<GeneratedPlanResult> GeneratePlanAsync(Goal goal, PersonalModel? personalModel = null, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generating realistic plan for goal '{Title}' (Priority: {Priority})", goal.Title, goal.Priority);

        var titleLower = (goal.Title + " " + goal.Description).ToLowerInvariant();

        // Standard default session duration
        var targetSession = personalModel?.AverageSessionMinutes.HasValue == true
            ? (int)Math.Clamp(personalModel.AverageSessionMinutes.Value, 25, 90)
            : 45;

        List<(string Title, string Description, int MinuteMultiplier, string Category, int DayOffset)> blueprint;

        if (titleLower.Contains("code") || titleLower.Contains("app") || titleLower.Contains("api") ||
            titleLower.Contains("hackathon") || titleLower.Contains("dev") || titleLower.Contains("software") ||
            titleLower.Contains("build") || titleLower.Contains("feature") || titleLower.Contains("mvp"))
        {
            blueprint = new()
            {
                ("System Design & API Contracts", "Map domain models, endpoint specifications, and interface contracts.", 1, "architecture", 0),
                ("Core Backend & Data Persistence", "Implement models, database repository operations, and validation logic.", 2, "backend", 1),
                ("Frontend UI & State Integration", "Build interactive views, wire store handlers, and link API client.", 2, "frontend", 2),
                ("End-to-End Flow Verification", "Run full lifecycle test cases, handle edge cases, and verify telemetry.", 1, "testing", 3),
                ("Polish & Deployment Readiness", "Refine UX styling, clean up logs, and review documentation checklist.", 1, "release", 4)
            };
        }
        else if (titleLower.Contains("learn") || titleLower.Contains("study") || titleLower.Contains("read") ||
                 titleLower.Contains("exam") || titleLower.Contains("course") || titleLower.Contains("book"))
        {
            blueprint = new()
            {
                ("Curriculum Breakdown & Resource Setup", "Audit syllabus, bookmark primary texts, and establish weekly study goals.", 1, "planning", 0),
                ("Core Fundamentals Deep-Dive", "Work through initial foundational modules with active note-taking.", 2, "study", 1),
                ("Hands-on Application & Practice", "Complete practical exercises and flashcard retrieval drills.", 2, "practice", 2),
                ("Synthesis & Mind Mapping", "Summarize core concepts into self-contained reference cheat sheets.", 1, "review", 3),
                ("Self-Assessment & Knowledge Check", "Complete practice problem sets and identify areas requiring reinforcement.", 1, "testing", 4)
            };
        }
        else if (titleLower.Contains("fitness") || titleLower.Contains("workout") || titleLower.Contains("run") ||
                 titleLower.Contains("health") || titleLower.Contains("gym") || titleLower.Contains("diet"))
        {
            blueprint = new()
            {
                ("Baseline Benchmark & Target Calibration", "Record starting metrics, define weekly training splits, and prepare gear.", 1, "assessment", 0),
                ("Conditioning & Form Focus Session", "Execute foundational session with strict tempo and biomechanical alignment.", 1, "training", 1),
                ("Progressive Overload Drill", "Increase training intensity by 5-10% while maintaining target heart rate.", 1, "training", 2),
                ("Active Recovery & Mobility Work", "Perform deep mobility drills, foam rolling, and hydration tracking.", 1, "recovery", 3),
                ("Weekly Review & Progression Log", "Evaluate recovery score, log progression metrics, and adjust weights.", 1, "review", 4)
            };
        }
        else if (titleLower.Contains("write") || titleLower.Contains("article") || titleLower.Contains("post") ||
                 titleLower.Contains("blog") || titleLower.Contains("essay") || titleLower.Contains("paper"))
        {
            blueprint = new()
            {
                ("Narrative Outline & Source Synthesis", "Draft the central thesis statement, core arguments, and supporting citations.", 1, "research", 0),
                ("First Pass Rough Draft Sprint", "Draft all primary body sections without self-editing.", 2, "drafting", 1),
                ("Structural Review & Argument Tightening", "Refine transitions, eliminate redundant claims, and strengthen topic sentences.", 1, "editing", 2),
                ("Voice, Flow & Formatting Polish", "Polish headline, sub-headings, pull-quotes, and tone consistency.", 1, "proofreading", 3),
                ("Final Proofread & Distribution", "Final typographic inspection and scheduled publication.", 1, "publishing", 4)
            };
        }
        else
        {
            blueprint = new()
            {
                ("Discovery & Context Gathering", $"Establish scope, constraints, and success criteria for '{goal.Title}'.", 1, "foundation", 0),
                ("First Execution Sprint", "Tackle the most critical high-leverage deliverables first.", 2, "execution", 1),
                ("Midpoint Review & Iteration", "Review progress, identify roadblocks, and refine remaining tasks.", 1, "refinement", 2),
                ("Final Delivery & Verification", "Complete final checklist and verify against original goal specifications.", 1, "delivery", 3)
            };
        }

        // Adjust day spacing based on TargetDate if available
        var totalTasks = blueprint.Count;
        var availableDays = 5;
        if (goal.TargetDate.HasValue)
        {
            var diffDays = (int)Math.Max(1, (goal.TargetDate.Value.Date - DateTime.UtcNow.Date).TotalDays);
            availableDays = Math.Min(diffDays, 30);
        }

        var tasks = new List<GeneratedTaskItem>();
        for (var i = 0; i < blueprint.Count; i++)
        {
            var item = blueprint[i];
            var computedMinutes = Math.Clamp(targetSession * item.MinuteMultiplier, 20, 120);
            var computedDayOffset = (int)Math.Round((double)i / totalTasks * availableDays);

            tasks.Add(new GeneratedTaskItem
            {
                Title = item.Title,
                Description = item.Description,
                EstimatedMinutes = computedMinutes,
                Category = item.Category,
                DayOffset = computedDayOffset
            });
        }

        var summary = personalModel?.AverageSessionMinutes.HasValue == true
            ? $"Generated {tasks.Count}-step execution plan for '{goal.Title}', calibrated to your recorded ~{personalModel.AverageSessionMinutes.Value:F0}m average session duration."
            : $"Generated {tasks.Count}-step realistic execution plan for '{goal.Title}' with balanced milestone pacing.";

        return Task.FromResult(new GeneratedPlanResult
        {
            Summary = summary,
            Tasks = tasks
        });
    }
}
