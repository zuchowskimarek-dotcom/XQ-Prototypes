// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Policy: Policy.PreferClean
/// Prefers clean containers over used ones.
/// </summary>
public interface IPolicyPreferCleanPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "c2fe09a9-1f8e-44a0-8092-bc72bf364679";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyPreferCleanParameters parameters,
        CancellationToken ct = default);
}
