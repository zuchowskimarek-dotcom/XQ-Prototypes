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
    const string PolicyId = "71ec12f5-1e95-46be-b88e-bb24085f7b14";

    Task<PolicyResult> ApplyAsync(
        PolicyContext ctx,
        RetryBudgetParameters parameters,
        CancellationToken ct = default);
}
