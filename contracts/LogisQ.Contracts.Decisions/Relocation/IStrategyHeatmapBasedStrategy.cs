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
    const string StrategyId = "fb5d7819-6ea0-46b7-a7c4-47a0ed83277c";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyHeatmapBasedParameters parameters,
        CancellationToken ct = default);
}
