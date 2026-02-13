// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Strategy: Strategy.ByProductGroup
/// Stacking rules derived from product group classification.
/// </summary>
public interface IStrategyByProductGroupStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "9999acbf-a5d7-4e39-b13b-6326c62378ce";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
