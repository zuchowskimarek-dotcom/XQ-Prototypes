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
    const string StrategyId = "095f898e-b36c-47db-ad58-f305c3df53d0";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyWeightedScoreParameters parameters,
        CancellationToken ct = default);
}
