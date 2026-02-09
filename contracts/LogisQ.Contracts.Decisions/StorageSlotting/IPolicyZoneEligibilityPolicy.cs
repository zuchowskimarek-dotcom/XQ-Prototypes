// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Policy: Policy.ZoneEligibility
/// Validates item is allowed in target zone.
/// </summary>
public interface IPolicyZoneEligibilityPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "0377d36c-32bc-4fd2-b2c9-870f45d41514";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyZoneEligibilityParameters parameters,
        CancellationToken ct = default);
}
