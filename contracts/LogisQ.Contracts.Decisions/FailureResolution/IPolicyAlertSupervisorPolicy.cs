// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy: Policy.AlertSupervisor
/// Notifies shift supervisor on failure.
/// </summary>
public interface IPolicyAlertSupervisorPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "238191e3-404b-45df-ae83-f4627ec22d3b";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyAlertSupervisorParameters parameters,
        CancellationToken ct = default);
}
