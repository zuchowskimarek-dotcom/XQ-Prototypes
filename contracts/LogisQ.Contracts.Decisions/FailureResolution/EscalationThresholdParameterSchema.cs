// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Parameter validation schema for EscalationThreshold (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class EscalationThresholdParameterSchema
{
    /// <summary>EscalateAfterSeconds (int)</summary>
    public static readonly ParameterSpec EscalateAfterSeconds =
        new(
        "EscalateAfterSeconds",
        Type: "int",
        Required: true
    );
}
