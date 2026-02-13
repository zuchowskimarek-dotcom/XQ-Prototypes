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
    const string PolicyId = "79da90f4-648b-4734-8ca6-58bd15b875f8";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyZoneEligibilityParameters parameters,
        CancellationToken ct = default);
}
