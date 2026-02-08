import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { buildManifest, validateManifest, manifestInclude } from '../manifestBuilder';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

// ─── GET /api/manifest/all — Export ALL domains as manifests ───

router.get('/all', async (_req, res) => {
    try {
        const domains = await prisma.decisionDomain.findMany({
            include: manifestInclude,
            orderBy: { name: 'asc' },
        });

        const results = domains.map((domain) => {
            const manifest = buildManifest(domain);
            const { valid, validationErrors } = validateManifest(manifest);
            return { manifest, valid, validationErrors };
        });

        const allValid = results.every((r) => r.valid);
        res.json({ allValid, domains: results });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to export all manifests' });
    }
});

// ─── GET /api/domains/:id/manifest — Export single PolicyManifestV2 ───
//     Always returns 200 with { manifest, valid, validationErrors }

router.get('/:id/manifest', async (req, res) => {
    try {
        const domain = await prisma.decisionDomain.findUnique({
            where: { id: req.params.id },
            include: manifestInclude,
        });

        if (!domain) {
            res.status(404).json({ error: 'Domain not found' });
            return;
        }

        const manifest = buildManifest(domain);
        const { valid, validationErrors } = validateManifest(manifest);

        res.json({ manifest, valid, validationErrors });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate manifest' });
    }
});

export default router;
