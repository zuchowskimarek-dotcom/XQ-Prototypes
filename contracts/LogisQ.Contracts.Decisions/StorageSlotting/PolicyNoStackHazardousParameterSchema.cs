// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Parameter validation schema for PolicyNoStackHazardous (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class PolicyNoStackHazardousParameterSchema
{
    /// <summary>hazmatClasses (string)</summary>
    public static readonly ParameterSpec HazmatClasses =
        new(
        "hazmatClasses",
        Type: "string",
        Required: true
    );
}
