import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './ManifestViewerPage.css';

interface ValidationError {
    path: string;
    message: string;
    params?: Record<string, unknown>;
}

interface DomainResult {
    manifest: Record<string, unknown>;
    valid: boolean;
    validationErrors: ValidationError[];
}

export function BulkManifestViewerPage() {
    const navigate = useNavigate();
    const [manifestJson, setManifestJson] = useState<string>('');
    const [allValid, setAllValid] = useState<boolean | null>(null);
    const [totalErrors, setTotalErrors] = useState(0);
    const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorsExpanded, setErrorsExpanded] = useState(true);
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get('/api/manifest/all');
                setManifestJson(JSON.stringify(data, null, 2));
                setAllValid(data.allValid);
                setDomainResults(data.domains || []);
                const errCount = (data.domains || []).reduce(
                    (sum: number, d: DomainResult) => sum + d.validationErrors.length, 0
                );
                setTotalErrors(errCount);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Failed to load manifests';
                setManifestJson(`// Error: ${msg}`);
                setAllValid(false);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSaveAs = async () => {
        const defaultName = `policy-manifests-all-${new Date().toISOString().slice(0, 10)}.json`;

        // Try the modern File System Access API (Chrome/Edge)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: defaultName,
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(manifestJson);
                await writable.close();
                setToast(`✅ Saved to ${handle.name}`);
                setTimeout(() => setToast(null), 4000);
                return;
            } catch (err: any) {
                // User cancelled the picker
                if (err.name === 'AbortError') return;
                console.warn('showSaveFilePicker failed, falling back:', err);
            }
        }

        // Fallback for Safari/Firefox — prompt for filename, then download
        const fileName = prompt('Save manifest as:', defaultName);
        if (!fileName) return;

        const blob = new Blob([manifestJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 150);
        setToast(`✅ Downloaded ${fileName}`);
        setTimeout(() => setToast(null), 4000);
    };

    if (loading) return <div className="page-loading">Generating manifests…</div>;

    // Collect all errors across all domains
    const allErrors: { domain: string; errors: ValidationError[] }[] = domainResults
        .filter(d => d.validationErrors.length > 0)
        .map(d => ({
            domain: (d.manifest as any)?.decisionDomain || 'Unknown',
            errors: d.validationErrors,
        }));

    return (
        <div className="manifest-viewer-page">
            <div className="manifest-toolbar">
                <div className="manifest-toolbar-left">
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        <ArrowBackIcon fontSize="small" /> Back to Domains
                    </button>
                    <h2>All Manifests</h2>
                    <span className="manifest-version-badge">{domainResults.length} domains</span>
                    {allValid !== null && (
                        <span className={`manifest-status-badge ${allValid ? 'valid' : 'invalid'}`}>
                            {allValid ? (
                                <><CheckCircleOutlineIcon fontSize="small" /> All Valid</>
                            ) : (
                                <><ErrorOutlineIcon fontSize="small" /> {totalErrors} Error{totalErrors !== 1 ? 's' : ''}</>
                            )}
                        </span>
                    )}
                </div>
                <div className="manifest-toolbar-right">
                    <button className="btn btn-primary" onClick={handleSaveAs}>
                        <SaveAltIcon fontSize="small" /> Save As…
                    </button>
                </div>
            </div>

            {allErrors.length > 0 && (
                <div className="manifest-errors">
                    <button className="manifest-errors-toggle" onClick={() => setErrorsExpanded(!errorsExpanded)}>
                        <span className="manifest-errors-title">
                            Schema Validation Errors ({totalErrors})
                        </span>
                        {errorsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </button>
                    {errorsExpanded && (
                        <div className="manifest-errors-list">
                            {allErrors.map((group) =>
                                group.errors.map((err, i) => (
                                    <div key={`${group.domain}-${i}`} className="manifest-error-item">
                                        <span className="manifest-error-path">{group.domain}: {err.path || '/'}</span>
                                        <span className="manifest-error-msg">{err.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="manifest-editor-container">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={manifestJson}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        fontSize: 13,
                        minimap: { enabled: true },
                        wordWrap: 'on',
                        tabSize: 2,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>

            {toast && <div className="toast-msg">{toast}</div>}
        </div>
    );
}
