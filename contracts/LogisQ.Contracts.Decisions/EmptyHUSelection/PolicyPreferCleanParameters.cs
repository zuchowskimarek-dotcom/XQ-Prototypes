// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Policy parameters for PolicyPreferClean.
/// </summary>
public sealed record PolicyPreferCleanParameters
{
    /// <summary>cleanlinessGrade (enum)</summary>
    public required string CleanlinessGrade { get; init; }
}
