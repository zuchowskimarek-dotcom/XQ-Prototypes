// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Parameter validation schema for StrategyAutoRetry (Strategy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class StrategyAutoRetryParameterSchema
{
    /// <summary>backoffMultiplier (decimal)</summary>
    public static readonly ParameterSpec BackoffMultiplier =
        new(
        "backoffMultiplier",
        Type: "decimal",
        Required: true
    );
}
