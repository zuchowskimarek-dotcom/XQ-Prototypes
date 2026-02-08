import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
    validate,
    CreateRuleSchema, UpdateRuleSchema,
    CreatePolicySchema, UpdatePolicySchema, SetStrategySchema,
    CreateParameterSchema, UpdateParameterSchema,
} from '../validation';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

function calcSpecificity(contextFilter: Record<string, unknown>): number {
    return Object.keys(contextFilter).length;
}

// ─── GET /api/rules/:id — PolicyRule detail ───

router.get('/:id', async (req, res) => {
    try {
        const rule = await prisma.policyRule.findUnique({
            where: { id: req.params.id },
            include: {
                strategy: true,
                policies: true,
                systemParameters: true,
            },
        });

        if (!rule) {
            res.status(404).json({ error: 'Rule not found' });
            return;
        }

        res.json(rule);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch rule' });
    }
});

// ─── POST /api/rules — Create PolicyRule ───

router.post('/', validate(CreateRuleSchema), async (req, res) => {
    try {
        const { scopeId, contextFilter } = req.body;
        const filter = contextFilter || {};
        const rule = await prisma.policyRule.create({
            data: {
                scopeId,
                contextFilter: filter,
                specificityScore: calcSpecificity(filter),
            },
            include: {
                strategy: true,
                policies: true,
                systemParameters: true,
            },
        });
        res.status(201).json(rule);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to create rule' });
    }
});

// ─── PUT /api/rules/:id — Update contextFilter ───

router.put('/:id', validate(UpdateRuleSchema), async (req, res) => {
    try {
        const body = req.body as { contextFilter: Record<string, unknown> };
        const filter = body.contextFilter || {};
        const rule = await prisma.policyRule.update({
            where: { id: req.params.id as string },
            data: {
                contextFilter: filter as any,
                specificityScore: calcSpecificity(filter),
            },
            include: {
                strategy: true,
                policies: true,
                systemParameters: true,
            },
        });
        res.json(rule);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to update rule' });
    }
});

// ─── DELETE /api/rules/:id ───

router.delete('/:id', async (req, res) => {
    try {
        await prisma.policyRule.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to delete rule' });
    }
});

// ─── POST /api/rules/:id/policies — Add PolicyDefinition ───

router.post('/:id/policies', validate(CreatePolicySchema), async (req, res) => {
    try {
        const body = req.body as { name: string; description?: string; parameters?: Record<string, unknown> };
        const policy = await prisma.policyDefinition.create({
            data: { name: body.name, description: body.description, parameters: (body.parameters || {}) as any, ruleId: req.params.id as string },
        });
        res.status(201).json(policy);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to add policy' });
    }
});

// ─── DELETE /api/rules/:id/policies/:policyId ───

router.delete('/:id/policies/:policyId', async (req, res) => {
    try {
        await prisma.policyDefinition.delete({ where: { id: req.params.policyId } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to remove policy' });
    }
});

// ─── PUT /api/rules/:id/policies/:policyId — Update PolicyDefinition ───

router.put('/:id/policies/:policyId', validate(UpdatePolicySchema), async (req, res) => {
    try {
        const body = req.body as { name?: string; description?: string; parameters?: Record<string, unknown> };
        const policy = await prisma.policyDefinition.update({
            where: { id: req.params.policyId as string },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.parameters !== undefined && { parameters: body.parameters as any }),
            },
        });
        res.json(policy);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to update policy' });
    }
});

router.put('/:id/strategy', validate(SetStrategySchema), async (req, res) => {
    try {
        const body = req.body as { name: string; description?: string; parameters?: Record<string, unknown> };
        // Upsert: replace existing strategy or create new one (1:1 relation via @unique ruleId)
        const strategy = await prisma.strategyDefinition.upsert({
            where: { ruleId: req.params.id as string },
            update: { name: body.name, description: body.description, parameters: (body.parameters || {}) as any },
            create: { name: body.name, description: body.description, parameters: (body.parameters || {}) as any, ruleId: req.params.id as string },
        });
        res.json(strategy);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to set strategy' });
    }
});

// ─── DELETE /api/rules/:id/strategy — Clear StrategyDefinition ───

router.delete('/:id/strategy', async (req, res) => {
    try {
        await prisma.strategyDefinition.delete({ where: { ruleId: req.params.id } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to clear strategy' });
    }
});

// ─── POST /api/rules/:id/parameters — Add SystemParameter ───

router.post('/:id/parameters', validate(CreateParameterSchema), async (req, res) => {
    try {
        const body = req.body as { paramId: string; type: string; description?: string; value?: string };
        const param = await prisma.systemParameter.create({
            data: { paramId: body.paramId, type: body.type, description: body.description, value: body.value, ruleId: req.params.id as string },
        });
        res.status(201).json(param);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to add parameter' });
    }
});

// ─── PUT /api/rules/:id/parameters/:paramId ───

router.put('/:id/parameters/:paramId', validate(UpdateParameterSchema), async (req, res) => {
    try {
        const body = req.body as { value?: string; type?: string; description?: string };
        const param = await prisma.systemParameter.update({
            where: { id: req.params.paramId as string },
            data: { value: body.value, type: body.type, description: body.description },
        });
        res.json(param);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to update parameter' });
    }
});

// ─── DELETE /api/rules/:id/parameters/:paramId ───

router.delete('/:id/parameters/:paramId', async (req, res) => {
    try {
        await prisma.systemParameter.delete({ where: { id: req.params.paramId } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to remove parameter' });
    }
});

export default router;
