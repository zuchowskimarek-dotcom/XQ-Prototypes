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
    const string StrategyId = "a58e495f-a19b-407f-9c45-fdc2b5e65412";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
