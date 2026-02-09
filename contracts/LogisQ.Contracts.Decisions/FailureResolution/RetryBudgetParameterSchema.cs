// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Parameter validation schema for RetryBudget (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class RetryBudgetParameterSchema
{
    /// <summary>MaxRetries (int)</summary>
    public static readonly ParameterSpec MaxRetries =
        new(
        "MaxRetries",
        Type: "int",
        Required: true
    );

    /// <summary>RetryDelaySeconds (int)</summary>
    public static readonly ParameterSpec RetryDelaySeconds =
        new(
        "RetryDelaySeconds",
        Type: "int",
        Required: true
    );
}
