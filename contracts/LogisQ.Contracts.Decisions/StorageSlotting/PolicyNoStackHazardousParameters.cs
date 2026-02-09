// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Policy parameters for PolicyNoStackHazardous.
/// </summary>
public sealed record PolicyNoStackHazardousParameters
{
    /// <summary>hazmatClasses (string)</summary>
    public required string HazmatClasses { get; init; }
}
