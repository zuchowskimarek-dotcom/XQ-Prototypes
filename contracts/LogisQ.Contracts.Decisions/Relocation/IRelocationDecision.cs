// Auto-generated from XyronQ metadata — DO NOT EDIT
// Domain: Relocation v1.0.0

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.Relocation;

/// <summary>
/// Decision façade for Relocation.
/// Governs when and how inventory is relocated within the warehouse.
/// </summary>
public interface IRelocationDecision
{
    /// <summary>
    /// Determines when relocation is triggered.
    /// </summary>
    Task<DecisionResult> RelocationTriggerAsync(
        DecisionInput input,
        DecisionContext ctx,
        CancellationToken ct = default);
}
