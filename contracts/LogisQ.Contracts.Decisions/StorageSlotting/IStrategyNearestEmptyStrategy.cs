// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Strategy: Strategy.NearestEmpty
/// Selects the nearest empty slot by distance.
/// </summary>
public interface IStrategyNearestEmptyStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "4c079fcc-c841-48f5-afd3-12078e265701";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyNearestEmptyParameters parameters,
        CancellationToken ct = default);
}
