// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.EmptyHUSelection;

/// <summary>
/// Strategy: Strategy1
/// 
/// </summary>
public interface IStrategy1Strategy : IStrategy
{
    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>
    const string StrategyId = "28a362dd-9273-4733-9550-841b4d7f3bd0";

    Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        EmptyParameters parameters,
        CancellationToken ct = default);
}
