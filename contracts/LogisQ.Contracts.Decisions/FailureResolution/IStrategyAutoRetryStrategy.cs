// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Strategy: Strategy.AutoRetry
/// Automatic retry with exponential backoff.
/// </summary>
public interface IStrategyAutoRetryStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "62af4082-e5e2-4916-9d2b-0ce0643c2972";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyAutoRetryParameters parameters,
        CancellationToken ct = default);
}
