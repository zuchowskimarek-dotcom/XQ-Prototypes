namespace LogisQ.Contracts;

/// <summary>
/// Describes a filter shape used for specificity-based rule matching.
/// Generated per domain (e.g. StorageSlottingFilterShapes).
/// </summary>
/// <param name="ShapeId">Unique shape identifier (e.g. "shape:plantArea+zone").</param>
/// <param name="Keys">Context filter keys that define this shape.</param>
/// <param name="PriorityClass">Number of filter keys — higher = more specific.</param>
public record ContextFilterShape(
    string ShapeId,
    string[] Keys,
    int PriorityClass
);

/// <summary>
/// Describes a parameter's metadata for runtime validation and UI tooling.
/// Generated per strategy/policy (e.g. StrategyWeightedScoreParameterSchema).
/// </summary>
/// <param name="Name">Parameter name as defined in XyronQ metadata.</param>
/// <param name="Type">Parameter type string (e.g. "decimal", "int", "bool", "enum").</param>
/// <param name="Required">Whether this parameter must be provided at runtime.</param>
public record ParameterSpec(
    string Name,
    string Type = "string",
    bool Required = true
);

/// <summary>
/// Empty parameter record for strategies/policies that have no parameters.
/// </summary>
public sealed record EmptyParameters;
