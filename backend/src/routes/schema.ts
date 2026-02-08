import { Router } from 'express';
import { getSchema, setSchema, resetSchema, isUsingFactorySchema, getValidator } from '../schemaStore';

const router = Router();

// ─── GET /api/schema — Return current schema ───
router.get('/', (_req, res) => {
    res.json({
        schema: getSchema(),
        isFactory: isUsingFactorySchema(),
    });
});

// ─── PUT /api/schema — Replace current schema ───
router.put('/', (req, res) => {
    try {
        const schema = req.body;
        if (!schema || typeof schema !== 'object') {
            res.status(400).json({ error: 'Request body must be a valid JSON Schema object' });
            return;
        }
        setSchema(schema);
        res.json({ success: true, message: 'Schema saved and compiled successfully', isFactory: false });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        res.status(422).json({ error: 'Invalid JSON Schema — compilation failed', details: message });
    }
});

// ─── POST /api/schema/reset — Restore factory default ───
router.post('/reset', (_req, res) => {
    const factory = resetSchema();
    res.json({ success: true, message: 'Schema reset to factory default', schema: factory, isFactory: true });
});

// ─── POST /api/schema/validate — Dry-run validation of a document ───
router.post('/validate', (req, res) => {
    try {
        const document = req.body;
        const validate = getValidator();
        const valid = validate(document);

        if (!valid) {
            res.status(422).json({
                valid: false,
                errors: validate.errors?.map((e) => ({
                    path: e.instancePath,
                    message: e.message,
                    params: e.params,
                })),
            });
            return;
        }
        res.json({ valid: true });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        res.status(500).json({ error: 'Validation failed', details: message });
    }
});

export default router;
