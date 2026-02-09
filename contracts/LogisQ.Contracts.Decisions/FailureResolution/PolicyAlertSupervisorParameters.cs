// Auto-generated from XyronQ metadata — DO NOT EDIT

using LogisQ.Contracts;

namespace LogisQ.Contracts.Decisions.FailureResolution;

/// <summary>
/// Policy parameters for PolicyAlertSupervisor.
/// </summary>
public sealed record PolicyAlertSupervisorParameters
{
    /// <summary>notificationChannel (enum)</summary>
    public required string NotificationChannel { get; init; }
}
