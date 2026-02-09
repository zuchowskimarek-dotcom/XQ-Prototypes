// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.Relocation;

/// <summary>
/// Context filter shape descriptors for Relocation.
/// WMS computes specificity from these shapes — specificity is never hardcoded.
/// </summary>
public static class RelocationFilterShapes
{
    /// <summary>Shape: shape:default (priority 0)</summary>
    public static readonly ContextFilterShape Default =
        new("shape:default", Array.Empty<string>(), PriorityClass: 0);

    /// <summary>Shape: shape:plantArea (priority 1)</summary>
    public static readonly ContextFilterShape PlantArea =
        new("shape:plantArea", new[] { "plantArea" }, PriorityClass: 1);
}
