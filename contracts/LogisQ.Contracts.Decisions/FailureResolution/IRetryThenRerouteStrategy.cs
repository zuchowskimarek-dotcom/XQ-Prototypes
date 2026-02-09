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
    const string StrategyId = "0c726f6f-f1bb-4cdb-b4ca-f810fffc27c8";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
