// ─── C# Code Generator ───
// Reads PolicyManifest data and produces a Map<filename, C# source>
// Per CodeGen Analysis: generates ONLY interfaces, sealed records, constants, metadata.
// NEVER generates method bodies or business logic.

import { toPascalCase, toCamelCase, toNamespaceSegment, toCSharpType, safeCSharpId } from './naming';
import crypto from 'crypto';

// ─── Types for the generator input (matches Prisma include shape) ───

interface RuleParameter {
    id: string;
    type: string;
    value?: unknown;
}

interface ParameterMap {
    [key: string]: RuleParameter;
}

interface PolicyDefinitionData {
    id: string;
    name: string;
    description?: string | null;
    parameters: ParameterMap | unknown;
}

interface StrategyDefinitionData {
    id: string;
    name: string;
    description?: string | null;
    parameters: ParameterMap | unknown;
}

interface PolicyRuleData {
    id: string;
    contextFilter: Record<string, unknown>;
    specificityScore: number;
    strategy: StrategyDefinitionData | null;
    policies: PolicyDefinitionData[];
}

interface DecisionScopeData {
    id: string;
    name: string;
    description?: string | null;
    rules: PolicyRuleData[];
}

interface DecisionDomainData {
    id: string;
    name: string;
    description?: string | null;
    version: string;
    scopes: DecisionScopeData[];
}

// ─── The Prisma include shape needed by the generator ───

export const codegenInclude = {
    scopes: {
        include: {
            rules: {
                include: {
                    strategy: true,
                    policies: true,
                },
            },
        },
    },
};

// ─── Main entry point ───

export function generateCSharpForDomain(domain: DecisionDomainData): Map<string, string> {
    const files = new Map<string, string>();
    const ns = toNamespaceSegment(domain.name);
    const fullNs = `LogisQ.Contracts.Decisions.${ns}`;

    // Collect all unique strategies and policies across all scopes
    const strategies = new Map<string, { def: StrategyDefinitionData; scopeName: string }>();
    const policies = new Map<string, { def: PolicyDefinitionData; scopeName: string }>();
    const filterShapes = new Map<string, { keys: string[]; priorityClass: number }>();

    for (const scope of domain.scopes) {
        for (const rule of scope.rules) {
            // Strategies
            if (rule.strategy) {
                const key = rule.strategy.name;
                if (!strategies.has(key)) {
                    strategies.set(key, { def: rule.strategy, scopeName: scope.name });
                }
            }

            // Policies
            for (const policy of rule.policies) {
                const key = policy.name;
                if (!policies.has(key)) {
                    policies.set(key, { def: policy, scopeName: scope.name });
                }
            }

            // Filter shapes
            const filterKeys = Object.keys(rule.contextFilter as Record<string, unknown>).sort();
            const shapeId = filterKeys.length === 0
                ? 'shape:default'
                : `shape:${filterKeys.join('+')}`;
            if (!filterShapes.has(shapeId)) {
                filterShapes.set(shapeId, {
                    keys: filterKeys,
                    priorityClass: filterKeys.length,
                });
            }
        }
    }

    // 1. Domain façade interface
    files.set(
        `I${ns}Decision.cs`,
        generateDomainFacade(domain, fullNs),
    );

    // 2. Filter shapes catalog
    files.set(
        `${ns}FilterShapes.cs`,
        generateFilterShapes(domain, filterShapes, fullNs),
    );

    // 3. Strategy interfaces + parameters + schemas
    for (const [name, { def }] of strategies) {
        const stratName = safeCSharpId(name);
        files.set(
            `I${stratName}Strategy.cs`,
            generateStrategyInterface(def, fullNs),
        );
        const params = asParameterMap(def.parameters);
        if (Object.keys(params).length > 0) {
            files.set(
                `${stratName}Parameters.cs`,
                generateParameterRecord(stratName, params, fullNs, 'Strategy'),
            );
            files.set(
                `${stratName}ParameterSchema.cs`,
                generateParameterSchema(stratName, params, fullNs, 'Strategy'),
            );
        }
    }

    // 4. Policy interfaces + parameters + schemas
    for (const [name, { def }] of policies) {
        const polName = safeCSharpId(name);
        files.set(
            `I${polName}Policy.cs`,
            generatePolicyInterface(def, fullNs),
        );
        const params = asParameterMap(def.parameters);
        if (Object.keys(params).length > 0) {
            files.set(
                `${polName}Parameters.cs`,
                generateParameterRecord(polName, params, fullNs, 'Policy'),
            );
            files.set(
                `${polName}ParameterSchema.cs`,
                generateParameterSchema(polName, params, fullNs, 'Policy'),
            );
        }
    }

    // 5. Generation metadata
    files.set('_Generated.g.cs', generateMetadata(domain, fullNs));

    return files;
}

// ─── Generate for all domains ───

export function generateCSharpForAllDomains(domains: DecisionDomainData[]): Map<string, string> {
    const files = new Map<string, string>();

    for (const domain of domains) {
        const ns = toNamespaceSegment(domain.name);
        const domainFiles = generateCSharpForDomain(domain);
        for (const [fileName, content] of domainFiles) {
            files.set(`${ns}/${fileName}`, content);
        }
    }

    // Package-level files
    files.set('LogisQ.Contracts.Decisions.csproj', generateCsproj(domains));
    files.set('Directory.Build.props', generateDirectoryBuildProps());
    files.set('README.md', generateReadme(domains));

    return files;
}

// ═══════════════════════════════════════════════════════════════
// Template functions (pure string builders — no logic)
// ═══════════════════════════════════════════════════════════════

function generateDomainFacade(domain: DecisionDomainData, ns: string): string {
    const domainName = toNamespaceSegment(domain.name);
    const methods = domain.scopes.map((scope) => {
        const scopeName = toPascalCase(scope.name);
        const methodName = scopeName.replace(/^Decide/, '').replace(/^Select/, '').replace(/^Resolve/, '');
        return [
            `    /// <summary>`,
            `    /// ${scope.description || scope.name}`,
            `    /// </summary>`,
            `    Task<DecisionResult> ${methodName}Async(`,
            `        DecisionInput input,`,
            `        DecisionContext ctx,`,
            `        CancellationToken ct = default);`,
        ].join('\n');
    });

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        `// Domain: ${domain.name} v${domain.version}`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// Decision façade for ${domain.name}.`,
        `/// ${domain.description || ''}`,
        `/// </summary>`,
        `public interface I${domainName}Decision`,
        `{`,
        methods.join('\n\n'),
        `}`,
        ``,
    ].join('\n');
}

function generateFilterShapes(
    domain: DecisionDomainData,
    shapes: Map<string, { keys: string[]; priorityClass: number }>,
    ns: string,
): string {
    const domainName = toNamespaceSegment(domain.name);
    const entries = Array.from(shapes.entries()).map(([shapeId, { keys, priorityClass }]) => {
        const fieldName = keys.length === 0
            ? 'Default'
            : toPascalCase(keys.join('_'));
        const keysArray = keys.length === 0
            ? 'Array.Empty<string>()'
            : `new[] { ${keys.map((k) => `"${k}"`).join(', ')} }`;

        return [
            `    /// <summary>Shape: ${shapeId} (priority ${priorityClass})</summary>`,
            `    public static readonly ContextFilterShape ${fieldName} =`,
            `        new("${shapeId}", ${keysArray}, PriorityClass: ${priorityClass});`,
        ].join('\n');
    });

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// Context filter shape descriptors for ${domain.name}.`,
        `/// WMS computes specificity from these shapes — specificity is never hardcoded.`,
        `/// </summary>`,
        `public static class ${domainName}FilterShapes`,
        `{`,
        entries.join('\n\n'),
        `}`,
        ``,
    ].join('\n');
}

function generateStrategyInterface(strategy: StrategyDefinitionData, ns: string): string {
    const name = safeCSharpId(strategy.name);
    const params = asParameterMap(strategy.parameters);
    const hasParams = Object.keys(params).length > 0;
    const paramType = hasParams ? `${name}Parameters` : 'EmptyParameters';

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// Strategy: ${strategy.name}`,
        `/// ${strategy.description || ''}`,
        `/// </summary>`,
        `public interface I${name}Strategy : IStrategy`,
        `{`,
        `    /// <summary>Stable strategy identifier from XyronQ metadata.</summary>`,
        `    const string StrategyId = "${strategy.id}";`,
        ``,
        `    Task<StrategyResult> ExecuteAsync(`,
        `        StrategyInput input,`,
        `        ${paramType} parameters,`,
        `        CancellationToken ct = default);`,
        `}`,
        ``,
    ].join('\n');
}

function generatePolicyInterface(policy: PolicyDefinitionData, ns: string): string {
    const name = safeCSharpId(policy.name);
    const params = asParameterMap(policy.parameters);
    const hasParams = Object.keys(params).length > 0;
    const paramType = hasParams ? `${name}Parameters` : 'EmptyParameters';

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// Policy: ${policy.name}`,
        `/// ${policy.description || ''}`,
        `/// </summary>`,
        `public interface I${name}Policy : IPolicy`,
        `{`,
        `    /// <summary>Stable policy identifier from XyronQ metadata.</summary>`,
        `    const string PolicyId = "${policy.id}";`,
        ``,
        `    Task<PolicyResult> ApplyAsync(`,
        `        PolicyContext ctx,`,
        `        ${paramType} parameters,`,
        `        CancellationToken ct = default);`,
        `}`,
        ``,
    ].join('\n');
}

function generateParameterRecord(
    entityName: string,
    params: ParameterMap,
    ns: string,
    kind: 'Strategy' | 'Policy',
): string {
    const properties = Object.entries(params).map(([key, param]) => {
        const csharpType = toCSharpType(param.type);
        const propName = safeCSharpId(key);
        // Reference types (string) need 'required' to satisfy nullable analysis
        const needsRequired = csharpType === 'string' || csharpType.endsWith('[]');
        const modifier = needsRequired ? 'required ' : '';
        return [
            `    /// <summary>${key} (${param.type})</summary>`,
            `    public ${modifier}${csharpType} ${propName} { get; init; }`,
        ].join('\n');
    });

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// ${kind} parameters for ${entityName}.`,
        `/// </summary>`,
        `public sealed record ${entityName}Parameters`,
        `{`,
        properties.join('\n\n'),
        `}`,
        ``,
    ].join('\n');
}

function generateParameterSchema(
    entityName: string,
    params: ParameterMap,
    ns: string,
    kind: 'Strategy' | 'Policy',
): string {
    const specs = Object.entries(params).map(([key, param]) => {
        const value = param.value;
        const parts = [
            `        "${key}",`,
            `        Type: "${param.type}",`,
            `        Required: true`,
        ];

        return [
            `    /// <summary>${key} (${param.type})</summary>`,
            `    public static readonly ParameterSpec ${safeCSharpId(key)} =`,
            `        new(`,
            parts.join('\n'),
            `    );`,
        ].join('\n');
    });

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// Parameter validation schema for ${entityName} (${kind}).`,
        `/// Machine-readable metadata for runtime validation and UI tooling.`,
        `/// </summary>`,
        `public static class ${entityName}ParameterSchema`,
        `{`,
        specs.join('\n\n'),
        `}`,
        ``,
    ].join('\n');
}

function generateMetadata(domain: DecisionDomainData, ns: string): string {
    const hash = crypto.createHash('sha256')
        .update(JSON.stringify(domain))
        .digest('hex');
    const timestamp = new Date().toISOString();

    return [
        `// Auto-generated from XyronQ metadata — DO NOT EDIT`,
        `// Regeneration replaces this file. Do not add handwritten code here.`,
        ``,
        `using LogisQ.Contracts;`,
        ``,
        `namespace ${ns};`,
        ``,
        `/// <summary>`,
        `/// Generation metadata for drift detection and version tracking.`,
        `/// </summary>`,
        `public static class Generated`,
        `{`,
        `    /// <summary>Source decision domain.</summary>`,
        `    public const string DomainName = "${domain.name}";`,
        ``,
        `    /// <summary>Domain version at generation time.</summary>`,
        `    public const string DomainVersion = "${domain.version}";`,
        ``,
        `    /// <summary>SHA-256 hash of the source manifest data.</summary>`,
        `    public const string ManifestHash = "${hash}";`,
        ``,
        `    /// <summary>Timestamp of code generation.</summary>`,
        `    public const string GeneratedAt = "${timestamp}";`,
        `}`,
        ``,
    ].join('\n');
}

/** Compute SHA-256 hash for a domain — exported for use by the hash endpoint. */
export function computeDomainHash(domain: DecisionDomainData): string {
    return crypto.createHash('sha256')
        .update(JSON.stringify(domain))
        .digest('hex');
}

function generateCsproj(domains: DecisionDomainData[]): string {
    // Use the highest version among all domains
    const versions = domains.map((d) => d.version);
    const maxVersion = versions.sort().pop() || '1.0.0';
    const domainList = domains.map((d) => d.name).join(', ');
    const year = new Date().getFullYear();

    return [
        `<Project Sdk="Microsoft.NET.Sdk">`,
        ``,
        `  <PropertyGroup>`,
        `    <TargetFramework>net9.0</TargetFramework>`,
        `    <ImplicitUsings>enable</ImplicitUsings>`,
        `    <Nullable>enable</Nullable>`,
        ``,
        `    <!-- NuGet Package Metadata -->`,
        `    <PackageId>LogisQ.Contracts.Decisions</PackageId>`,
        `    <Version>${maxVersion}</Version>`,
        `    <Authors>XyronQ Code Generator</Authors>`,
        `    <Company>LogisQ</Company>`,
        `    <Description>Auto-generated decision contracts from XyronQ policy metadata. Contains typed interfaces, sealed records, filter shapes, and parameter schemas for: ${domainList}. DO NOT EDIT — regenerate from XyronQ.</Description>`,
        `    <Copyright>Copyright © ${year} LogisQ</Copyright>`,
        `    <PackageTags>LogisQ;WES;Decisions;Contracts;CodeGen;XyronQ</PackageTags>`,
        `    <PackageReadmeFile>README.md</PackageReadmeFile>`,
        ``,
        `    <!-- Build Configuration -->`,
        `    <GeneratePackageOnBuild>true</GeneratePackageOnBuild>`,
        `    <GenerateDocumentationFile>true</GenerateDocumentationFile>`,
        `    <NoWarn>$(NoWarn);CS1591</NoWarn>`,
        `  </PropertyGroup>`,
        ``,
        `  <ItemGroup>`,
        `    <None Include="README.md" Pack="true" PackagePath="\\" />`,
        `  </ItemGroup>`,
        ``,
        `  <ItemGroup>`,
        `    <ProjectReference Include="../LogisQ.Contracts.Core/LogisQ.Contracts.Core.csproj" />`,
        `  </ItemGroup>`,
        ``,
        `</Project>`,
        ``,
    ].join('\n');
}

function generateDirectoryBuildProps(): string {
    return [
        `<!-- C2 Constraint: Assembly reference direction enforcement -->`,
        `<!-- This file is auto-generated by XyronQ. DO NOT EDIT. -->`,
        `<!-- Generated contracts must NEVER reference WMS implementation assemblies. -->`,
        `<Project>`,
        `  <PropertyGroup>`,
        `    <!-- Treat reference direction violations as build errors -->`,
        `    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>`,
        `  </PropertyGroup>`,
        ``,
        `  <!-- Forbidden references: if any of these are added, the build will fail -->`,
        `  <!-- This list is maintained by CI; see ci/check-assembly-references.sh -->`,
        `</Project>`,
        ``,
    ].join('\n');
}

function generateReadme(domains: DecisionDomainData[]): string {
    const timestamp = new Date().toISOString();
    const table = domains.map((d) => `| ${d.name} | ${d.version} | ${d.scopes.length} |`).join('\n');

    return [
        `# LogisQ.Contracts.Decisions`,
        ``,
        `Auto-generated typed decision contracts from [XyronQ](https://xyronq.logisq.com) policy metadata.`,
        ``,
        `> ⚠️ **DO NOT EDIT** — regenerate from XyronQ Dashboard → Export C#`,
        ``,
        `## Domains`,
        ``,
        `| Domain | Version | Scopes |`,
        `|---|---|---|`,
        table,
        ``,
        `## Usage`,
        ``,
        '```csharp',
        `// Reference this package:`,
        `// dotnet add package LogisQ.Contracts.Decisions`,
        ``,
        `// Implement a strategy:`,
        `public class MyStrategy : IWeightedScoreStrategy`,
        `{`,
        `    public Task<StrategyResult> ExecuteAsync(`,
        `        StrategyInput input,`,
        `        StrategyWeightedScoreParameters parameters,`,
        `        CancellationToken ct) { /* ... */ }`,
        `}`,
        '```',
        ``,
        `Generated at: ${timestamp}`,
        ``,
    ].join('\n');
}


// ─── Helpers ───

function asParameterMap(params: unknown): ParameterMap {
    if (!params || typeof params !== 'object' || Array.isArray(params)) {
        return {};
    }
    const map: ParameterMap = {};
    for (const [key, val] of Object.entries(params as Record<string, unknown>)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const p = val as Record<string, unknown>;
            if (typeof p.type === 'string') {
                map[key] = {
                    id: (p.id as string) || key,
                    type: p.type,
                    value: p.value,
                };
            }
        }
    }
    return map;
}
