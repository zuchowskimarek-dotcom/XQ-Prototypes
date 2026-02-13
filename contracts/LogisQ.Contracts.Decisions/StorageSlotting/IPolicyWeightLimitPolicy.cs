// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Policy: Policy.WeightLimit
/// Ensures slot weight capacity is not exceeded.
/// </summary>
public interface IPolicyWeightLimitPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "e029a27b-f07f-4830-b3d0-cc6531d8032c";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyWeightLimitParameters parameters,
        CancellationToken ct = default);
}
