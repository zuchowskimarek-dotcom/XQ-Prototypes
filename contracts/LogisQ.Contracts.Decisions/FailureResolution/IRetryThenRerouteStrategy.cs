// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Strategy: RetryThenReroute
/// Retries the transport, then reroutes to an alternate path on repeated failure.
/// </summary>
public interface IRetryThenRerouteStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "ff80b987-7692-4fd9-a989-9cee4dd8f4d1";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
