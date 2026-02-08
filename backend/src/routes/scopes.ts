import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { validate, CreateScopeSchema, UpdateScopeSchema } from '../validation';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

// ─── GET /api/scopes/:id — Scope detail with all policy rules ───

router.get('/:id', async (req, res) => {
    try {
        const scope = await prisma.decisionScope.findUnique({
            where: { id: req.params.id },
            include: {
                rules: {
                    include: {
                        strategy: true,
                        policies: true,
                        systemParameters: true,
                    },
                    orderBy: { specificityScore: 'asc' },
                },
            },
        });

        if (!scope) {
            res.status(404).json({ error: 'Scope not found' });
            return;
        }

        // Enrich each rule with per-rule validation issues
        const enrichedRules = scope.rules.map((rule) => {
            const issues: string[] = [];

            if (!rule.strategy) {
                issues.push('Rule missing strategy');
            }

            return { ...rule, issues };
        });

        res.json({ ...scope, rules: enrichedRules });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch scope' });
    }
});

// ─── POST /api/scopes — Create scope ───

router.post('/', validate(CreateScopeSchema), async (req, res) => {
    try {
        const { name, description, domainId } = req.body;
        const scope = await prisma.decisionScope.create({
            data: { name, description, domainId },
        });
        res.status(201).json(scope);
    } catch (e: any) {
        if (e?.code === 'P2002') {
            res.status(409).json({ error: 'Scope name already exists in this domain' });
            return;
        }
        console.error(e);
        res.status(400).json({ error: 'Failed to create scope' });
    }
});

// ─── PUT /api/scopes/:id ───

router.put('/:id', validate(UpdateScopeSchema), async (req, res) => {
    try {
        const body = req.body as { name?: string; description?: string };
        const scope = await prisma.decisionScope.update({
            where: { id: req.params.id as string },
            data: { name: body.name, description: body.description },
        });
        res.json(scope);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to update scope' });
    }
});

// ─── DELETE /api/scopes/:id ───

router.delete('/:id', async (req, res) => {
    try {
        await prisma.decisionScope.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to delete scope' });
    }
});

export default router;
