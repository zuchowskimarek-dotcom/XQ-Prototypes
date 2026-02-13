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
    const string StrategyId = "af22fc40-4620-4fe2-a56b-7737375e485c";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyNearestEmptyParameters parameters,
        CancellationToken ct = default);
}
