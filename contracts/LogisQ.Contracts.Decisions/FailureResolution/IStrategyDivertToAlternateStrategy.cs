// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Strategy: Strategy.DivertToAlternate
/// Diverts to alternate conveyor path on failure.
/// </summary>
public interface IStrategyDivertToAlternateStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "c5c3f9b0-4c3c-48c4-b886-288103b14c3b";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
