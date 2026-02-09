// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Strategy: Strategy.QualityFirst
/// Selects containers by quality grade (A > B > C).
/// </summary>
public interface IStrategyQualityFirstStrategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "9a36fdbf-679a-4541-9c87-4527d49da7fa";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyQualityFirstParameters parameters,
        CancellationToken ct = default);
}
