import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { validate, CreateDomainSchema, UpdateDomainSchema } from '../validation';
import { buildManifest, validateManifest, manifestInclude } from '../manifestBuilder';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

// ─── GET /api/domains — List all domains with scope/rule counts + health ───

router.get('/', async (_req, res) => {
    try {
        const domains = await prisma.decisionDomain.findMany({
            include: manifestInclude,
            orderBy: { name: 'asc' },
        });

        const result = domains.map((d) => {
            const scopeCount = d.scopes.length;
            const allRules = d.scopes.flatMap((s) => s.rules);
            const ruleCount = allRules.length;

            const issues: string[] = [];

            // Structural checks
            for (const scope of d.scopes) {
                for (const rule of scope.rules) {
                    if (!rule.strategy) {
                        issues.push(`${scope.name}: rule missing strategy`);
                    }
                }
            }

            // §8.12 schema validation
            const manifest = buildManifest(d);
            const { valid, validationErrors } = validateManifest(manifest);
            if (!valid) {
                for (const err of validationErrors) {
                    issues.push(`Schema: ${err.path || '/'} ${err.message}`);
                }
            }

            return {
                id: d.id,
                name: d.name,
                description: d.description,
                version: d.version,
                scopeCount,
                ruleCount,
                issueCount: issues.length,
                issues,
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
            };
        });

        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch domains' });
    }
});

// ─── GET /api/domains/:id — Domain detail with scopes ───

router.get('/:id', async (req, res) => {
    try {
        const domain = await prisma.decisionDomain.findUnique({
            where: { id: req.params.id },
            include: {
                scopes: {
                    include: {
                        rules: {
                            include: { strategy: true },
                        },
                    },
                    orderBy: { name: 'asc' },
                },
            },
        });

        if (!domain) {
            res.status(404).json({ error: 'Domain not found' });
            return;
        }

        const scopes = domain.scopes.map((s) => {
            const issues: string[] = [];
            for (const rule of s.rules) {
                if (!rule.strategy) issues.push('Rule missing strategy');
            }
            return {
                id: s.id,
                name: s.name,
                description: s.description,
                domainId: s.domainId,
                ruleCount: s.rules.length,
                issueCount: issues.length,
                issues,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            };
        });

        res.json({
            id: domain.id,
            name: domain.name,
            description: domain.description,
            version: domain.version,
            scopes,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch domain' });
    }
});

// ─── POST /api/domains ───

router.post('/', validate(CreateDomainSchema), async (req, res) => {
    try {
        const { name, description, version } = req.body;
        const domain = await prisma.decisionDomain.create({
            data: { name, description, version: version || '1.0.0' },
        });
        res.status(201).json(domain);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to create domain' });
    }
});

// ─── PUT /api/domains/:id ───

router.put('/:id', validate(UpdateDomainSchema), async (req, res) => {
    try {
        const body = req.body as { name?: string; description?: string; version?: string };
        const domain = await prisma.decisionDomain.update({
            where: { id: req.params.id as string },
            data: { name: body.name, description: body.description, version: body.version },
        });
        res.json(domain);
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to update domain' });
    }
});

// ─── DELETE /api/domains/:id ───

router.delete('/:id', async (req, res) => {
    try {
        await prisma.decisionDomain.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(400).json({ error: 'Failed to delete domain' });
    }
});

export default router;
