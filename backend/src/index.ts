import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import domainRoutes from './routes/domains';
import scopeRoutes from './routes/scopes';
import ruleRoutes from './routes/rules';
import manifestRoutes from './routes/manifest';
import schemaRoutes from './routes/schema';

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'xq-prototypes-api' });
});

// Routes
app.use('/api/manifest', manifestRoutes);    // /api/manifest/all (before domains to avoid /:id conflict)
app.use('/api/domains', domainRoutes);
app.use('/api/domains', manifestRoutes);     // /api/domains/:id/manifest
app.use('/api/scopes', scopeRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/schema', schemaRoutes);

app.listen(PORT, () => {
    console.log(`[XQ-Prototypes API] Running on http://localhost:${PORT}`);
});
