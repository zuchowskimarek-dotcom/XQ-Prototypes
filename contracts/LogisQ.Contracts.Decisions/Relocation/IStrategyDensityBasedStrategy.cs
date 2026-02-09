// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.Relocation;

/// <summary>
/// Strategy: Strategy.DensityBased
/// Triggers relocation when zone density exceeds threshold.
/// </summary>
public interface IStrategyDensityBasedStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "b4ebed20-07d0-4f6f-9f09-2dbdb7483075";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
