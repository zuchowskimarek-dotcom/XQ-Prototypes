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
    const string StrategyId = "ab67df76-9349-4b5b-89f6-7cac360abd73";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyAutoRetryParameters parameters,
        CancellationToken ct = default);
}
