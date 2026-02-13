// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Strategy: RetryThenEscalate
/// Retries the transport, then escalates to manual intervention.
/// </summary>
public interface IRetryThenEscalateStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "c1b674d5-4343-4aaa-a070-302a8cb4dda8";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
