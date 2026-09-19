using Microsoft.Extensions.Logging.Abstractions;
using Momentum.Api.Data;
using Momentum.Api.Models;
using Momentum.Api.Services.PersonalModelService;
using Xunit;

namespace Momentum.Tests;

public class PersonalModelServiceTests
{
    [Fact]
    public async Task Apply_CalculatesRealCompletionRateAndAverages()
    {
        var signalRepo = new MongoRepository<BehaviorSignal>(null, "signals", NullLogger<MongoRepository<BehaviorSignal>>.Instance);
        var modelRepo = new MongoRepository<PersonalModel>(null, "personal_models", NullLogger<MongoRepository<PersonalModel>>.Instance);
        var service = new PersonalModelService(signalRepo, modelRepo, NullLogger<PersonalModelService>.Instance);

        var userId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        // 1st task completed: 40 mins actual, 45 mins estimated
        await service.RecordSignalAsync(userId, Guid.NewGuid(), planId, SignalType.Completed, actualMinutes: 40, estimatedMinutes: 45);
        // 2nd task completed: 30 mins actual, 30 mins estimated
        await service.RecordSignalAsync(userId, Guid.NewGuid(), planId, SignalType.Completed, actualMinutes: 30, estimatedMinutes: 30);
        // 3rd task skipped
        var model = await service.RecordSignalAsync(userId, Guid.NewGuid(), planId, SignalType.Skipped, actualMinutes: null, estimatedMinutes: 45);

        Assert.NotNull(model);
        Assert.Equal(3, model.TotalSignals);
        Assert.Equal(2, model.CompletedCount);
        Assert.Equal(1, model.SkippedCount);
        Assert.Equal(0.67, model.CompletionRate);
        Assert.Equal(35.0, model.AverageSessionMinutes);
        Assert.NotEmpty(model.PreferredProductivePeriods);
        Assert.NotEmpty(model.ExplainabilityStatements);
        Assert.Contains(model.ExplainabilityStatements, s => s.Contains("Momentum is learning your work patterns"));
    }

    [Fact]
    public void PersonalModel_EmptySignals_HasSafeDefaults()
    {
        var model = new PersonalModel();
        model.Apply(Enumerable.Empty<BehaviorSignal>());

        Assert.Equal(0, model.TotalSignals);
        Assert.Equal(0, model.CompletionRate);
        Assert.Null(model.AverageSessionMinutes);
        Assert.Null(model.AverageEstimateAccuracy);
        Assert.NotEmpty(model.ExplainabilityStatements);
    }
}
