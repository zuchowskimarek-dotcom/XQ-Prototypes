// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Strategy parameters for StrategyAutoRetry.
/// </summary>
public sealed record StrategyAutoRetryParameters
{
    /// <summary>backoffMultiplier (decimal)</summary>
    public decimal BackoffMultiplier { get; init; }
}
