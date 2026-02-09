// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Parameter validation schema for StrategyNearestEmpty (Strategy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class StrategyNearestEmptyParameterSchema
{
    /// <summary>maxCandidates (int)</summary>
    public static readonly ParameterSpec MaxCandidates =
        new(
        "maxCandidates",
        Type: "int",
        Required: true
    );
}
