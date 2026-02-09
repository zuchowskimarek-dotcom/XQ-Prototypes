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
    const string PolicyId = "bb2b0e85-295b-43d1-b578-0e8bd465d489";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
