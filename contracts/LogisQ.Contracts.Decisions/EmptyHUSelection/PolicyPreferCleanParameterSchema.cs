// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Parameter validation schema for PolicyPreferClean (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class PolicyPreferCleanParameterSchema
{
    /// <summary>cleanlinessGrade (enum)</summary>
    public static readonly ParameterSpec CleanlinessGrade =
        new(
        "cleanlinessGrade",
        Type: "enum",
        Required: true
    );
}
