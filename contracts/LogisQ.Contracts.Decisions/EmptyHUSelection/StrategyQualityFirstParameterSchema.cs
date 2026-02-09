// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Parameter validation schema for StrategyQualityFirst (Strategy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class StrategyQualityFirstParameterSchema
{
    /// <summary>minGrade (enum)</summary>
    public static readonly ParameterSpec MinGrade =
        new(
        "minGrade",
        Type: "enum",
        Required: true
    );
}
