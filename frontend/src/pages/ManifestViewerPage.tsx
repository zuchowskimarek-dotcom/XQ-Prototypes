import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './ManifestViewerPage.css';

interface ValidationError {
    path: string;
    message: string;
    params?: Record<string, unknown>;
}

export function ManifestViewerPage() {
    const { domainId } = useParams();
    const navigate = useNavigate();
    const [manifestJson, setManifestJson] = useState<string>('');
    const [valid, setValid] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorsExpanded, setErrorsExpanded] = useState(true);
    const [domainName, setDomainName] = useState('');
    const [version, setVersion] = useState('');

    useEffect(() => {
        if (!domainId) return;
        (async () => {
            try {
                const { data } = await axios.get(`/api/domains/${domainId}/manifest`);

                // Both valid and invalid manifests now return 200
                // with { manifest, valid, validationErrors }
                setManifestJson(JSON.stringify(data.manifest, null, 2));
                setValid(data.valid);
                setErrors(data.validationErrors || []);
                setDomainName(data.manifest?.decisionDomain || '');
                setVersion(data.manifest?.version || '');
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Failed to load manifest';
                setManifestJson(`// Error: ${msg}`);
                setValid(false);
                setErrors([{ path: '', message: msg }]);
            } finally {
                setLoading(false);
            }
        })();
    }, [domainId]);

    const handleDownload = () => {
        const blob = new Blob([manifestJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = domainName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'manifest';
        a.download = `${safeName}_manifest_v${version || '0'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="page-loading">Generating manifest…</div>;

    return (
        <div className="manifest-viewer-page">
            <div className="manifest-toolbar">
                <div className="manifest-toolbar-left">
                    <button className="btn btn-secondary" onClick={() => navigate(`/domains/${domainId}`)}>
                        <ArrowBackIcon fontSize="small" /> Back to Domain
                    </button>
                    <h2>{domainName}</h2>
                    <span className="manifest-version-badge">v{version}</span>
                    {valid !== null && (
                        <span className={`manifest-status-badge ${valid ? 'valid' : 'invalid'}`}>
                            {valid ? (
                                <><CheckCircleOutlineIcon fontSize="small" /> Valid</>
                            ) : (
                                <><ErrorOutlineIcon fontSize="small" /> {errors.length} Error{errors.length !== 1 ? 's' : ''}</>
                            )}
                        </span>
                    )}
                </div>
                <div className="manifest-toolbar-right">
                    <button className="btn btn-primary" onClick={handleDownload}>
                        <DownloadIcon fontSize="small" /> Download JSON
                    </button>
                </div>
            </div>

            {!valid && errors.length > 0 && (
                <div className="manifest-errors">
                    <button className="manifest-errors-toggle" onClick={() => setErrorsExpanded(!errorsExpanded)}>
                        <span className="manifest-errors-title">
                            Schema Validation Errors ({errors.length})
                        </span>
                        {errorsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </button>
                    {errorsExpanded && (
                        <div className="manifest-errors-list">
                            {errors.map((err, i) => (
                                <div key={i} className="manifest-error-item">
                                    <span className="manifest-error-path">{err.path || '/'}</span>
                                    <span className="manifest-error-msg">{err.message}</span>
                                </div>
                            ))}
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
        </div>
    );
}
