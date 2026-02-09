// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy: Policy.MaxRetries
/// Limits the number of automatic retry attempts.
/// </summary>
public interface IPolicyMaxRetriesPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "0e94ff20-6e28-4239-97a8-6461c23bea08";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
