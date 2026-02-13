// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Strategy: Strategy.WeightedScore
/// Scores candidates by weighted criteria (distance, fill rate, ABC class).
/// </summary>
public interface IStrategyWeightedScoreStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "4f805f42-38a9-4eae-81b4-70a3f741bbdc";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyWeightedScoreParameters parameters,
        CancellationToken ct = default);
}
