// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Parameter validation schema for PolicyWeightLimit (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class PolicyWeightLimitParameterSchema
{
    /// <summary>safetyMarginKg (decimal)</summary>
    public static readonly ParameterSpec SafetyMarginKg =
        new(
        "safetyMarginKg",
        Type: "decimal",
        Required: true
    );
}
