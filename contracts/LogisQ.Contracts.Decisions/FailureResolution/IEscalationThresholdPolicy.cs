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
    const string PolicyId = "8a6f3c79-c288-4b25-8a8d-a0cb6db8ea5f";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        EscalationThresholdParameters parameters,
        CancellationToken ct = default);
}
