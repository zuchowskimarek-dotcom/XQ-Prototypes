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
    const string PolicyId = "23417b59-b312-4793-ab92-0994ac6ae1b4";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyAlertSupervisorParameters parameters,
        CancellationToken ct = default);
}
