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
    const string PolicyId = "ac383c68-919a-4a9e-9960-a0bd301ca8b7";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyPreferCleanParameters parameters,
        CancellationToken ct = default);
}
