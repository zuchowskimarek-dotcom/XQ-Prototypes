// ─── C# Export Routes ───
// GET /api/export/csharp/:domainId → single domain zip
// GET /api/export/csharp            → all domains zip
// GET /api/export/csharp/hash       → manifest hashes for drift detection

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import JSZip from 'jszip';
import { generateCSharpForDomain, generateCSharpForAllDomains, computeDomainHash, codegenInclude } from '../codegen/csharpGenerator';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

// ─── GET /api/export/csharp/hash — Manifest hashes for drift detection ───

router.get('/hash', async (_req, res) => {
    try {
        const domains = await prisma.decisionDomain.findMany({
            include: codegenInclude,
            orderBy: { name: 'asc' },
        });

        const hashes: Record<string, { hash: string; version: string }> = {};
        for (const domain of domains) {
            hashes[domain.name] = {
                hash: computeDomainHash(domain as any),
                version: domain.version,
            };
        }

        res.json({
            hashes,
            generatedAt: new Date().toISOString(),
        });
    } catch (e) {
        console.error('Hash computation error:', e);
        res.status(500).json({ error: 'Failed to compute hashes' });
    }
});

// ─── GET /api/export/csharp — All domains as NuGet package skeleton ───

router.get('/', async (_req, res) => {
    try {
        const domains = await prisma.decisionDomain.findMany({
            include: codegenInclude,
            orderBy: { name: 'asc' },
        });

        const files = generateCSharpForAllDomains(domains as any);
        const zip = new JSZip();

        for (const [path, content] of files) {
            zip.file(`LogisQ.Contracts.Decisions/${path}`, content);
        }

        const buffer = await zip.generateAsync({ type: 'nodebuffer' });

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="LogisQ.Contracts.Decisions.zip"',
        });
        res.send(buffer);
    } catch (e) {
        console.error('C# export error:', e);
        res.status(500).json({ error: 'Failed to generate C# contracts' });
    }
});

// ─── GET /api/export/csharp/:domainId — Single domain zip ───

router.get('/:domainId', async (req, res) => {
    try {
        const domain = await prisma.decisionDomain.findUnique({
            where: { id: req.params.domainId as string },
            include: codegenInclude,
        });

        if (!domain) {
            res.status(404).json({ error: 'Domain not found' });
            return;
        }

        const files = generateCSharpForDomain(domain as any);
        const ns = domain.name.replace(/[^a-zA-Z0-9]+/g, '');
        const zip = new JSZip();

        for (const [fileName, content] of files) {
            zip.file(`LogisQ.Contracts.${ns}/${fileName}`, content);
        }

        const buffer = await zip.generateAsync({ type: 'nodebuffer' });

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="LogisQ.Contracts.${ns}.zip"`,
        });
        res.send(buffer);
    } catch (e) {
        console.error('C# export error:', e);
        res.status(500).json({ error: 'Failed to generate C# contracts' });
    }
});

export default router;
