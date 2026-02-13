import { getValidator } from './schemaStore';

/* ─── Prisma include shape used for any domain→manifest query ─── */
export const manifestInclude = {
    scopes: {
        include: {
            rules: {
                include: {
                    strategy: true,
                    policies: true,
                    ruleParameters: true,
                },
                orderBy: { specificityScore: 'asc' as const },
            },
        },
    },
};

/* ─── Transform a DB domain → PolicyManifestV2 shape ─── */
export function buildManifest(domain: any) {
    const contentsByScope: Record<string, unknown[]> = {};

    for (const scope of domain.scopes) {
        const rules = scope.rules.map((rule: any) => {
            const policyRule: Record<string, unknown> = {
                contextFilter: rule.contextFilter,
            };

            if (rule.strategy) {
                const stratDef: Record<string, unknown> = {
                    id: rule.strategy.id,
                    name: rule.strategy.name,
                };
                if (rule.strategy.description) {
                    stratDef.description = rule.strategy.description;
                }
                const stratParams = rule.strategy.parameters as Record<string, unknown> | null;
                if (stratParams && Object.keys(stratParams).length > 0) {
                    stratDef.parameters = injectParamIds(stratParams);
                }
                policyRule.strategy = stratDef;
            }

            if (rule.policies.length > 0) {
                policyRule.policies = rule.policies.map((p: any) => {
                    const pDef: Record<string, unknown> = { id: p.id, name: p.name };
                    if (p.description) pDef.description = p.description;
                    const pParams = p.parameters as Record<string, unknown> | null;
                    if (pParams && Object.keys(pParams).length > 0) {
                        pDef.parameters = injectParamIds(pParams);
                    }
                    return pDef;
                });
            }

            if (rule.ruleParameters.length > 0) {
                policyRule.ruleParameters = rule.ruleParameters.map((sp: any) => {
                    const spDef: Record<string, unknown> = { id: sp.paramId, type: sp.type };
                    if (sp.description) spDef.description = sp.description;
                    if (sp.value !== null && sp.value !== undefined) {
                        if (sp.type === 'int') spDef.value = parseInt(sp.value, 10);
                        else if (sp.type === 'decimal') spDef.value = parseFloat(sp.value);
                        else if (sp.type === 'bool') spDef.value = sp.value === 'true';
                        else spDef.value = sp.value;
                    }
                    return spDef;
                });
            }

            return policyRule;
        });

        if (rules.length > 0) {
            contentsByScope[scope.name] = rules;
        }
    }

    return {
        id: domain.id,
        decisionDomain: domain.name,
        version: domain.version,
        contentsByScope,
    };
}

/* ─── Ensure every parameter object has an `id` field (= key name) ─── */
function injectParamIds(params: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(params)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            result[key] = { id: key, ...(val as Record<string, unknown>) };
        } else {
            result[key] = val;
        }
    }
    return result;
}

/* ─── Validate a manifest against §8.12 schema, return errors ─── */
export function validateManifest(manifest: unknown) {
    const validate = getValidator();
    const valid = validate(manifest);
    return {
        valid: !!valid,
        validationErrors: valid
            ? []
            : validate.errors?.map((e) => ({
                path: e.instancePath,
                message: e.message ?? '',
                params: e.params,
            })) ?? [],
    };
}
