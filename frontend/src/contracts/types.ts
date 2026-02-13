// ─── §8-aligned entity types ───

// §8.3 — Decision Domain (first-class UI entity)
export interface DecisionDomain {
    id: string;
    name: string;
    description: string | null;
    version: string;
    scopeCount: number;
    ruleCount: number;
    issueCount: number;
    issues: string[];
    createdAt: string;
    updatedAt: string;
}

// §8.4 — Decision Scope (summary in domain view)
export interface DecisionScopeSummary {
    id: string;
    name: string;
    description: string | null;
    domainId: string;
    ruleCount: number;
    issueCount: number;
    issues: string[];
    createdAt: string;
    updatedAt: string;
}

// §8.4 — Decision Scope (detail with full rules)
export interface DecisionScopeDetail {
    id: string;
    name: string;
    description: string | null;
    domainId: string;
    rules: PolicyRule[];
    createdAt: string;
    updatedAt: string;
}

// §8.3 — Decision Domain detail (with scope summaries)
export interface DecisionDomainDetail {
    id: string;
    name: string;
    description: string | null;
    version: string;
    scopes: DecisionScopeSummary[];
    createdAt: string;
    updatedAt: string;
}

// §8.7 — PolicyRule (contextual rule unit)
export interface PolicyRule {
    id: string;
    contextFilter: Record<string, string>;
    specificityScore: number;
    scopeId: string;
    strategy: StrategyDefinition | null;
    policies: PolicyDefinition[];
    ruleParameters: RuleParameter[];
    issues?: string[];
    createdAt: string;
    updatedAt: string;
}

// §8.8 — PolicyDefinition (constraints and permissions)
export interface PolicyDefinition {
    id: string;
    name: string;
    description: string | null;
    parameters: Record<string, { type: string; value: unknown }>;
    ruleId: string;
}

// §8.9 — StrategyDefinition (decision logic selection)
export interface StrategyDefinition {
    id: string;
    name: string;
    description: string | null;
    parameters: Record<string, { type: string; value: unknown }>;
    ruleId: string;
}

// §8.10 — RuleParameter (rule-level static config values)
export interface RuleParameter {
    id: string;
    paramId: string;
    type: string;
    description: string | null;
    value: string | null;
    ruleId: string;
}
