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
    const string PolicyId = "5829b419-82c5-4113-8a4a-01f5afd7f816";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        PolicyNoStackHazardousParameters parameters,
        CancellationToken ct = default);
}
