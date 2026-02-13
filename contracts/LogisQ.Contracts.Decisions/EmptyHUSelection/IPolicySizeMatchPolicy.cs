// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Policy: Policy.SizeMatch
/// Ensures container size matches order requirements.
/// </summary>
public interface IPolicySizeMatchPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "23eb4783-e6a5-4943-8789-9e9f53115919";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
