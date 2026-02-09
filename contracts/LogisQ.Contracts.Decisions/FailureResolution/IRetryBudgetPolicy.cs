// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy: RetryBudget
/// Limits retry attempts and delay between retries.
/// </summary>
public interface IRetryBudgetPolicy : IPolicy
{
    /// <summary>Stable policy identifier from XyronQ metadata.</summary>
    const string PolicyId = "c3fec976-9b23-40fb-a491-a3a9358457ad";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        RetryBudgetParameters parameters,
        CancellationToken ct = default);
}
