// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.Relocation;

/// <summary>
/// Strategy: Strategy.HeatmapBased
/// Uses access frequency heatmap to optimize placement.
/// </summary>
public interface IStrategyHeatmapBasedStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "558850d6-a7e8-4a46-bcb2-e2b31d232961";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyHeatmapBasedParameters parameters,
        CancellationToken ct = default);
}
