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
    const string StrategyId = "e04f921c-bf02-4a58-a230-dfcaff86f77c";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyQualityFirstParameters parameters,
        CancellationToken ct = default);
}
