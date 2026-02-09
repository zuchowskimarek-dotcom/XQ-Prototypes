// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Policy: Policy.NoStackHazardous
/// Prevents stacking of hazardous materials.
/// </summary>
public interface IPolicyNoStackHazardousPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "0ee56191-f8ee-4099-95a1-ddcc48f1ca84";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyNoStackHazardousParameters parameters,
        CancellationToken ct = default);
}
