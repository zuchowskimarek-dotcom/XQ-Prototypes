namespace LogisQ.Contracts;

/// <summary>
/// Input passed to a strategy's ExecuteAsync method.
/// </summary>
public record StrategyInput
{
    /// <summary>The decision input forwarded from the façade.</summary>
    public required DecisionInput Decision { get; init; }

    /// <summary>The matched context filter values for this rule.</summary>
    public required DecisionContext Context { get; init; }
}

/// <summary>
/// Result returned by a strategy execution.
/// </summary>
public record StrategyResult
{
    public bool IsSuccess { get; init; }
    public object? Outcome { get; init; }
    public string? Reason { get; init; }

    public static StrategyResult Success(object outcome) =>
        new() { IsSuccess = true, Outcome = outcome };

    public static StrategyResult NoCandidate(string reason) =>
        new() { IsSuccess = false, Reason = reason };
}
