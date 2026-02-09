// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Parameter validation schema for PolicyZoneEligibility (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class PolicyZoneEligibilityParameterSchema
{
    /// <summary>enforceABCClass (bool)</summary>
    public static readonly ParameterSpec EnforceABCClass =
        new(
        "enforceABCClass",
        Type: "bool",
        Required: true
    );
}
