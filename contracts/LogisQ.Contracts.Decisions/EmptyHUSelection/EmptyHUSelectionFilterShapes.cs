// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Context filter shape descriptors for EmptyHU.Selection.
/// WMS computes specificity from these shapes — specificity is never hardcoded.
/// </summary>
public static class EmptyHUSelectionFilterShapes
{
    /// <summary>Shape: shape:default (priority 0)</summary>
    public static readonly ContextFilterShape Default =
        new("shape:default", Array.Empty<string>(), PriorityClass: 0);

    /// <summary>Shape: shape:huType (priority 1)</summary>
    public static readonly ContextFilterShape HuType =
        new("shape:huType", new[] { "huType" }, PriorityClass: 1);
}
