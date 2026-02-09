// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Parameter validation schema for StrategyWeightedScore (Strategy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class StrategyWeightedScoreParameterSchema
{
    /// <summary>minScore (decimal)</summary>
    public static readonly ParameterSpec MinScore =
        new(
        "minScore",
        Type: "decimal",
        Required: true
    );

    /// <summary>normalizationMode (enum)</summary>
    public static readonly ParameterSpec NormalizationMode =
        new(
        "normalizationMode",
        Type: "enum",
        Required: true
    );
}
