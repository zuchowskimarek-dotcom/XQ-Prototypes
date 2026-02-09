// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Context filter shape descriptors for Failure.Resolution.
/// WMS computes specificity from these shapes — specificity is never hardcoded.
/// </summary>
public static class FailureResolutionFilterShapes
{
    /// <summary>Shape: shape:default (priority 0)</summary>
    public static readonly ContextFilterShape Default =
        new("shape:default", Array.Empty<string>(), PriorityClass: 0);

    /// <summary>Shape: shape:plantArea (priority 1)</summary>
    public static readonly ContextFilterShape PlantArea =
        new("shape:plantArea", new[] { "plantArea" }, PriorityClass: 1);

    /// <summary>Shape: shape:plantArea+storageType (priority 2)</summary>
    public static readonly ContextFilterShape PlantAreaStorageType =
        new("shape:plantArea+storageType", new[] { "plantArea", "storageType" }, PriorityClass: 2);
}
