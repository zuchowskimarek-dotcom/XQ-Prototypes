# LogisQ.Contracts.Decisions

Auto-generated typed decision contracts from [XyronQ](https://xyronq.logisq.com) policy metadata.

> ⚠️ **DO NOT EDIT** — regenerate from XyronQ Dashboard → Export C#

## Domains

| Domain | Version | Scopes |
|---|---|---|
| EmptyHU.Selection | 1.0.0 | 1 |
| Failure.Resolution | 1.0.0 | 2 |
| Relocation | 1.0.0 | 1 |
| Storage.Slotting | 1.0.0 | 2 |

## Usage

```csharp
// Reference this package:
// dotnet add package LogisQ.Contracts.Decisions

// Implement a strategy:
public class MyStrategy : IWeightedScoreStrategy
{
    public Task<StrategyResult> ExecuteAsync(
        StrategyInput input,
        StrategyWeightedScoreParameters parameters,
        CancellationToken ct) { /* ... */ }
}
```

Generated at: 2026-02-13T06:44:46.244Z
