// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.StorageSlotting;

/// <summary>
/// Strategy parameters for StrategyWeightedScore.
/// </summary>
public sealed record StrategyWeightedScoreParameters
{
    /// <summary>minScore (decimal)</summary>
    public decimal MinScore { get; init; }

    /// <summary>normalizationMode (enum)</summary>
    public required string NormalizationMode { get; init; }
}
