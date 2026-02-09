// Auto-generated from XyronQ metadata — DO NOT EDIT
// Domain: Storage.Slotting v1.0.0

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Decision façade for Storage.Slotting.
/// Determines where and how items are placed in storage areas. Covers slot selection, zone eligibility, and stacking rules.
/// </summary>
public interface IStorageSlottingDecision
{
    /// <summary>
    /// Selects the optimal storage location for incoming goods.
    /// </summary>
    Task<DecisionResult> StorageLocationAsync(
        DecisionInput input,
        DecisionContext ctx,
        CancellationToken ct = default);

    /// <summary>
    /// Determines whether stacking is allowed for a given handling unit.
    /// </summary>
    Task<DecisionResult> StackingPermissionAsync(
        DecisionInput input,
        DecisionContext ctx,
        CancellationToken ct = default);
}
