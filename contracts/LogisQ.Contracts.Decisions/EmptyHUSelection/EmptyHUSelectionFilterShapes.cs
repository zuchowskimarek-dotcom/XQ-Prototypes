// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Context filter shape descriptors for EmptyHU.Selection.
/// WMS computes specificity from these shapes — specificity is never hardcoded.
/// </summary>
public static class EmptyHUSelectionFilterShapes
{
    /// <summary>Shape: shape:huType (priority 1)</summary>
    public static readonly ContextFilterShape HuType =
        new("shape:huType", new[] { "huType" }, PriorityClass: 1);

    /// <summary>Shape: shape:processRef (priority 1)</summary>
    public static readonly ContextFilterShape ProcessRef =
        new("shape:processRef", new[] { "processRef" }, PriorityClass: 1);
}
