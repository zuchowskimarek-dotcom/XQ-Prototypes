namespace LogisQ.Contracts;

/// <summary>
/// Context passed to a policy's ApplyAsync method.
/// </summary>
public record PolicyContext
{
    /// <summary>The decision input forwarded from the façade.</summary>
    public required DecisionInput Decision { get; init; }

    /// <summary>The matched context filter values.</summary>
    public required DecisionContext Context { get; init; }

    /// <summary>Typed accessor for decision input properties.</summary>
    public T? Get<T>(string key) => Decision.Get<T>(key);
}

/// <summary>
/// Result returned by a policy evaluation.
/// </summary>
public record PolicyResult
{
    public bool IsAllowed { get; init; }
    public string? Reason { get; init; }
    public string? PolicyName { get; init; }

    public static PolicyResult Allow() =>
        new() { IsAllowed = true };

    public static PolicyResult Reject(string reason) =>
        new() { IsAllowed = false, Reason = reason };
}
