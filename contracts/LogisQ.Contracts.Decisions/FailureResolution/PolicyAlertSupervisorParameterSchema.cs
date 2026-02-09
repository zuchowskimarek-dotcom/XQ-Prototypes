// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Parameter validation schema for PolicyAlertSupervisor (Policy).
/// Machine-readable metadata for runtime validation and UI tooling.
/// </summary>
public static class PolicyAlertSupervisorParameterSchema
{
    /// <summary>notificationChannel (enum)</summary>
    public static readonly ParameterSpec NotificationChannel =
        new(
        "notificationChannel",
        Type: "enum",
        Required: true
    );
}
