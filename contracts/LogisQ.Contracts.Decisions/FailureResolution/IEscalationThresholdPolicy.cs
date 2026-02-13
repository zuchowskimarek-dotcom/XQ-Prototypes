// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy: EscalationThreshold
/// Defines the time window before escalation is triggered.
/// </summary>
public interface IEscalationThresholdPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "c5f0f0cf-832c-4ce2-aee8-c6aebc79c72d";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        EscalationThresholdParameters parameters,
        CancellationToken ct = default);
}
