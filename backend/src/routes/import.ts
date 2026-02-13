// ─── Import Route ───
// POST /api/domains/:id/import — Import manifest JSON into domain
// Validates against §8.12 schema, then seeds scopes/rules/strategies/policies/parameters

import { Router } from 'express';
import { PrismaClient, type Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { validateManifest } from '../manifestBuilder';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

// ─── POST /api/domains/:id/import ───

router.post('/:id/import', async (req, res) => {
    try {
        const domainId = req.params.id;

        // 1. Verify domain exists
        const domain = await prisma.decisionDomain.findUnique({
            where: { id: domainId },
        });

        if (!domain) {
            res.status(404).json({ error: 'Domain not found' });
            return;
        }

        const body = req.body;

        // 2. Accept either a full manifest or just { contentsByScope }
        const contentsByScope: Record<string, any[]> = body.contentsByScope ?? body;

        if (!contentsByScope || typeof contentsByScope !== 'object' || Array.isArray(contentsByScope)) {
            res.status(400).json({
                error: 'Invalid payload. Expected { contentsByScope: { "ScopeName": [...rules] } } or a full manifest object.',
            });
            return;
        }

        // 3. Build a full manifest for schema validation
        const manifestForValidation = {
            id: domain.id,
            decisionDomain: domain.name,
            version: domain.version,
            contentsByScope,
        };

        const { valid, validationErrors } = validateManifest(manifestForValidation);

        if (!valid) {
            res.status(400).json({
                error: 'Schema validation failed',
                validationErrors,
            });
            return;
        }

        // 4. Import into DB
        const counts = { scopes: 0, rules: 0, strategies: 0, policies: 0, parameters: 0 };

        for (const [scopeName, rules] of Object.entries(contentsByScope)) {
            // Upsert scope by (domainId, name)
            let scope = await prisma.decisionScope.findFirst({
                where: { domainId, name: scopeName },
            });

            if (!scope) {
                scope = await prisma.decisionScope.create({
                    data: { name: scopeName, domainId },
                });
                counts.scopes++;
            }

            // Create rules
            for (let ruleIdx = 0; ruleIdx < rules.length; ruleIdx++) {
                const ruleData = rules[ruleIdx];

                const contextFilter = ruleData.contextFilter ?? {};
                const specificityScore = Object.keys(contextFilter).length;

                const policyRule = await prisma.policyRule.create({
                    data: {
                        scopeId: scope.id,
                        contextFilter,
                        specificityScore,
                    },
                });
                counts.rules++;

                // Strategy
                if (ruleData.strategy) {
                    const strat = ruleData.strategy;
                    // Build parameters map: strategy.parameters holds { key: { id, type } } refs
                    const stratParams: Record<string, unknown> = {};
                    if (strat.parameters) {
                        for (const [key, val] of Object.entries(strat.parameters)) {
                            stratParams[key] = val;
                        }
                    }

                    await prisma.strategyDefinition.create({
                        data: {
                            ruleId: policyRule.id,
                            name: strat.name,
                            description: strat.description ?? null,
                            parameters: (Object.keys(stratParams).length > 0 ? stratParams : {}) as Prisma.InputJsonValue,
                        },
                    });
                    counts.strategies++;
                }

                // Policies
                if (ruleData.policies && Array.isArray(ruleData.policies)) {
                    for (const pol of ruleData.policies) {
                        const polParams: Record<string, unknown> = {};
                        if (pol.parameters) {
                            for (const [key, val] of Object.entries(pol.parameters)) {
                                polParams[key] = val;
                            }
                        }

                        await prisma.policyDefinition.create({
                            data: {
                                ruleId: policyRule.id,
                                name: pol.name,
                                description: pol.description ?? null,
                                parameters: (Object.keys(polParams).length > 0 ? polParams : {}) as Prisma.InputJsonValue,
                            },
                        });
                        counts.policies++;
                    }
                }

                // RuleParameters
                if (ruleData.ruleParameters && Array.isArray(ruleData.ruleParameters)) {
                    for (const param of ruleData.ruleParameters) {
                        let valueStr: string | null = null;
                        if (param.value !== undefined && param.value !== null) {
                            valueStr = String(param.value);
                        }

                        await prisma.ruleParameter.create({
                            data: {
                                ruleId: policyRule.id,
                                paramId: param.id,
                                type: param.type,
                                description: param.description ?? null,
                                value: valueStr,
                            },
                        });
                        counts.parameters++;
                    }
                }
            }
        }

        res.status(201).json({
            message: 'Import successful',
            imported: counts,
        });
    } catch (e) {
        console.error('Import error:', e);
        res.status(500).json({ error: 'Import failed', details: String(e) });
    }
});

export default router;
