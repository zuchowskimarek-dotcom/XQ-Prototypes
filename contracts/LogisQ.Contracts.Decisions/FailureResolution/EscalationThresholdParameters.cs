// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy parameters for EscalationThreshold.
/// </summary>
public sealed record EscalationThresholdParameters
{
    /// <summary>EscalateAfterSeconds (int)</summary>
    public int EscalateAfterSeconds { get; init; }
}
