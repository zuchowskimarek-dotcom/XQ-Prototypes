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
    const string PolicyId = "f3182a33-8813-4fca-bc28-3e26702eba8b";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
