import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// ─── §8.12 Name Pattern ───
// Names MUST match: ^[A-Za-z0-9._:-]+$
const NamePattern = /^[A-Za-z0-9._:-]+$/;

// ─── Reusable field schemas ───

const ContextFilterSchema = z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()])
).default({});

const ParamTypeEnum = z.enum(['bool', 'int', 'decimal', 'string', 'enum']);

// §8.12 SystemParameter shape for inline parameters on policies/strategies
const SystemParameterValueSchema = z.object({
    id: z.string().min(1, 'Parameter id is required'),
    type: ParamTypeEnum,
    description: z.string().optional(),
    value: z.unknown().optional(),
});

// ─── Domain schemas ───

export const CreateDomainSchema = z.object({
    name: z.string().min(1).regex(NamePattern, 'Name must match §8.12 pattern: ^[A-Za-z0-9._:-]+$'),
    description: z.string().optional(),
    version: z.string().optional(),
});

export const UpdateDomainSchema = z.object({
    name: z.string().min(1).regex(NamePattern, 'Name must match §8.12 pattern').optional(),
    description: z.string().optional(),
    version: z.string().optional(),
});

// ─── Scope schemas ───

export const CreateScopeSchema = z.object({
    name: z.string().min(1, 'Scope name is required'),
    description: z.string().nullable().optional(),
    domainId: z.string().uuid('domainId must be a valid UUID'),
});

export const UpdateScopeSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
});

// ─── Rule schemas ───

export const CreateRuleSchema = z.object({
    scopeId: z.string().uuid('scopeId must be a valid UUID'),
    contextFilter: ContextFilterSchema.optional(),
});

export const UpdateRuleSchema = z.object({
    contextFilter: ContextFilterSchema,
});

// ─── PolicyDefinition schemas ───

export const CreatePolicySchema = z.object({
    name: z.string().min(1).regex(NamePattern, 'Policy name must match §8.12 pattern: ^[A-Za-z0-9._:-]+$'),
    description: z.string().optional(),
    parameters: z.record(z.string(), SystemParameterValueSchema).optional(),
});

export const UpdatePolicySchema = z.object({
    name: z.string().min(1).regex(NamePattern, 'Policy name must match §8.12 pattern: ^[A-Za-z0-9._:-]+$').optional(),
    description: z.string().optional(),
    parameters: z.record(z.string(), SystemParameterValueSchema).optional(),
});

// ─── StrategyDefinition schemas ───

export const SetStrategySchema = z.object({
    name: z.string().min(1).regex(NamePattern, 'Strategy name must match §8.12 pattern: ^[A-Za-z0-9._:-]+$'),
    description: z.string().optional(),
    parameters: z.record(z.string(), SystemParameterValueSchema).optional(),
});

// ─── SystemParameter schemas ───

/** Validates that `value` is consistent with the declared `type`. */
function validateValueForType(data: { type?: string; value?: string | null }, ctx: z.RefinementCtx) {
    const { type, value } = data;
    if (value == null || value === '' || !type) return; // nothing to validate

    switch (type) {
        case 'int':
            if (!/^-?\d+$/.test(value)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['value'],
                    message: `Value "${value}" is not a valid integer`,
                });
            }
            break;
        case 'decimal':
            if (isNaN(Number(value))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['value'],
                    message: `Value "${value}" is not a valid decimal number`,
                });
            }
            break;
        case 'bool':
            if (!['true', 'false'].includes(value.toLowerCase())) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['value'],
                    message: `Value "${value}" is not a valid boolean (use "true" or "false")`,
                });
            }
            break;
        // 'string' and 'enum' accept any string value
    }
}

export const CreateParameterSchema = z.object({
    paramId: z.string().min(1, 'paramId is required'),
    type: ParamTypeEnum,
    description: z.string().optional(),
    value: z.string().optional(),
}).superRefine(validateValueForType);

export const UpdateParameterSchema = z.object({
    value: z.string().optional(),
    type: ParamTypeEnum.optional(),
    description: z.string().optional(),
}).superRefine(validateValueForType);

// ─── Validation middleware ───

/**
 * Express middleware that validates `req.body` against a Zod schema.
 * Returns 400 with structured errors if validation fails.
 * On success, replaces `req.body` with the parsed (typed) value.
 */
export function validate(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: result.error.issues.map((issue: z.core.$ZodIssue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }
        req.body = result.data;
        next();
    };
}
