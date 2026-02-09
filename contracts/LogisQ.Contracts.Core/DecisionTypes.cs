namespace LogisQ.Contracts;

/// <summary>
/// Input for a decision façade method. Contains the payload to evaluate.
/// </summary>
public record DecisionInput
{
    /// <summary>Unique identifier of the item being decided upon (e.g. HU ID, transport ID).</summary>
    public required string SubjectId { get; init; }

    /// <summary>Arbitrary payload properties accessible by strategies and policies.</summary>
    public Dictionary<string, object?> Properties { get; init; } = new();

    /// <summary>Typed property accessor.</summary>
    public T? Get<T>(string key) =>
        Properties.TryGetValue(key, out var val) && val is T typed ? typed : default;
}

/// <summary>
/// Runtime context passed alongside the decision input.
/// Contains contextual data used for rule matching and filter evaluation.
/// </summary>
public record DecisionContext
{
    /// <summary>Context filter values (e.g. plantArea, zone) for rule specificity matching.</summary>
    public Dictionary<string, object?> FilterValues { get; init; } = new();

    /// <summary>Typed context value accessor.</summary>
    public T? Get<T>(string key) =>
        FilterValues.TryGetValue(key, out var val) && val is T typed ? typed : default;
}

/// <summary>
/// Result of a decision façade evaluation.
/// </summary>
public record DecisionResult
{
    public bool IsSuccess { get; init; }
    public string? SelectedStrategy { get; init; }
    public object? Outcome { get; init; }
    public string? Reason { get; init; }
    public IReadOnlyList<PolicyResult> PolicyResults { get; init; } = [];

    public static DecisionResult Success(object outcome, string strategy) =>
        new() { IsSuccess = true, Outcome = outcome, SelectedStrategy = strategy };

    public static DecisionResult Rejected(string reason, IReadOnlyList<PolicyResult> policyResults) =>
        new() { IsSuccess = false, Reason = reason, PolicyResults = policyResults };
}
