import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CodeIcon from '@mui/icons-material/Code';
import { useDomainDetail } from '../hooks/useDomainDetail';
import { saveZipAs } from '../utils/saveZipAs';
import './DomainOverviewPage.css';

export function DomainOverviewPage() {
    const { domainId } = useParams<{ domainId: string }>();
    const { domain, loading, refetch } = useDomainDetail(domainId);
    const navigate = useNavigate();

    // New scope form state
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const handleCreateScope = async () => {
        if (!newName.trim() || !domainId) return;
        const res = await fetch('/api/scopes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || null, domainId }),
        });
        if (res.ok) {
            setNewName(''); setNewDesc(''); setShowNewForm(false);
            refetch();
        } else {
            const err = await res.json();
            alert(err.error || 'Failed to create scope');
        }
    };

    const handleDeleteScope = async (id: string, name: string) => {
        if (!confirm(`Delete scope "${name}" and all its rules?`)) return;
        await fetch(`/api/scopes/${id}`, { method: 'DELETE' });
        refetch();
    };

    if (loading || !domain) return <div className="page-loading">Loading…</div>;

    return (
        <div className="domain-overview-page">
            <Link to="/" className="back-link"><ArrowBackIcon fontSize="small" /> All Domains</Link>

            <div className="page-header-row">
                <div>
                    <h2>{domain.name}</h2>
                    {domain.description && <p className="domain-desc">{domain.description}</p>}
                    <span className="version-badge">v{domain.version}</span>
                </div>
                <div className="page-header-btns">
                    <button className="btn-secondary" onClick={() => navigate(`/domains/${domainId}/manifest`)}>
                        <FileDownloadIcon fontSize="small" /> Export Manifest
                    </button>
                    <button className="btn-secondary" onClick={() => {
                        const ns = domain.name.replace(/[^a-zA-Z0-9]+/g, '');
                        saveZipAs(`/api/export/csharp/${domainId}`, `LogisQ.Contracts.${ns}.zip`).catch((e) => alert(e.message));
                    }}>
                        <CodeIcon fontSize="small" /> Export C#
                    </button>
                    <button className="btn-primary" onClick={() => setShowNewForm(true)}>
                        <AddIcon fontSize="small" /> New Scope
                    </button>
                </div>
            </div>

            <div className="scope-grid">
                {domain.scopes.map((s) => (
                    <div
                        key={s.id}
                        className={`scope-card ${s.issueCount > 0 ? 'has-issues' : ''}`}
                        onClick={() => navigate(`/domains/${domainId}/scopes/${s.id}`)}
                    >
                        <div className="card-actions">
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteScope(s.id, s.name); }} title="Delete">
                                <DeleteIcon fontSize="small" />
                            </button>
                        </div>

                        <div className="card-header">
                            {s.issueCount === 0
                                ? <CheckCircleOutlineIcon className="health-ok" />
                                : <WarningAmberIcon className="health-warn" />
                            }
                            <h3>{s.name}</h3>
                        </div>

                        {s.description && <p className="card-desc">{s.description}</p>}

                        <div className="card-stats">
                            <span>{s.ruleCount} rule{s.ruleCount !== 1 ? 's' : ''}</span>
                            {s.issueCount > 0 && (
                                <>
                                    <span className="stat-sep">·</span>
                                    <span className="issue-count">{s.issueCount} issue{s.issueCount !== 1 ? 's' : ''}</span>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {/* New Scope form card */}
                {showNewForm && (
                    <div className="scope-card new-scope-form">
                        <h4>New Decision Scope</h4>
                        <input
                            type="text"
                            placeholder="Scope name (e.g. Decide.Storage.Location)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                        />
                        <div className="form-actions">
                            <button className="btn-primary" onClick={handleCreateScope}>Create</button>
                            <button className="btn-secondary" onClick={() => { setShowNewForm(false); setNewName(''); setNewDesc(''); }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
