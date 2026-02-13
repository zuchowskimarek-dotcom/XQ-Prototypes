// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Strategy: Strategy.FIFO
/// First-in-first-out slot allocation by receipt date.
/// </summary>
public interface IStrategyFIFOStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "7e2f54bc-e600-48ac-bd9c-face0b1f9afc";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
