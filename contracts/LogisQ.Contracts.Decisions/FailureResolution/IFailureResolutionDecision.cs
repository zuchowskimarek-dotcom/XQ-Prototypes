// Auto-generated from XyronQ metadata — DO NOT EDIT
// Domain: Failure.Resolution v1.0.0

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Decision façade for Failure.Resolution.
/// Defines how the system handles and resolves failures in automated and manual processes.
/// </summary>
public interface IFailureResolutionDecision
{
    /// <summary>
    /// Handles transport failures (conveyor jams, AGV errors).
    /// </summary>
    Task<DecisionResult> TransportFailureAsync(
        DecisionInput input,
        DecisionContext ctx,
        CancellationToken ct = default);

    /// <summary>
    /// Handles picking failures (short picks, wrong item).
    /// </summary>
    Task<DecisionResult> PickFailureAsync(
        DecisionInput input,
        DecisionContext ctx,
        CancellationToken ct = default);
}
