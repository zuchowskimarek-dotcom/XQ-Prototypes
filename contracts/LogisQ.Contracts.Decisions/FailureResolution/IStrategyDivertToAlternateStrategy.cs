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
    const string StrategyId = "e72c81cb-6aea-4f90-b9e6-79bb2e4baeab";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
