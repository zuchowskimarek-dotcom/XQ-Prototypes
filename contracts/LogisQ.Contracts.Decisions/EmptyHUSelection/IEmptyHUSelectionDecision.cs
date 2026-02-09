// Auto-generated from XyronQ metadata — DO NOT EDIT
// Domain: EmptyHU.Selection v1.0.0

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Decision façade for EmptyHU.Selection.
/// Determines how empty handling units are selected for replenishment or fulfillment.
/// </summary>
public interface IEmptyHUSelectionDecision
{
    /// <summary>
    /// Selects the source of empty handling units.
    /// </summary>
    Task<DecisionResult> EmptyHUAsync(
        DecisionInput input,
        DecisionContext ctx,
        CancellationToken ct = default);
}
