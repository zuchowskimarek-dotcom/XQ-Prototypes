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
    const string PolicyId = "de1e3300-8d2e-4105-a113-149f643ea6ad";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyWeightLimitParameters parameters,
        CancellationToken ct = default);
}
