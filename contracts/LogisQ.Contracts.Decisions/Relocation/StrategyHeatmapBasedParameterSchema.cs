// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.Relocation;

/// <summary>
/// Parameter validation schema for StrategyHeatmapBased (Strategy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class StrategyHeatmapBasedParameterSchema
{
    /// <summary>heatmapAlgorithm (enum)</summary>
    public static readonly ParameterSpec HeatmapAlgorithm =
        new(
        "heatmapAlgorithm",
        Type: "enum",
        Required: true
    );
}
