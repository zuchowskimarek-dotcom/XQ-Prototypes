// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy parameters for RetryBudget.
/// </summary>
public sealed record RetryBudgetParameters
{
    /// <summary>MaxRetries (int)</summary>
    public int MaxRetries { get; init; }

    /// <summary>RetryDelaySeconds (int)</summary>
    public int RetryDelaySeconds { get; init; }
}
