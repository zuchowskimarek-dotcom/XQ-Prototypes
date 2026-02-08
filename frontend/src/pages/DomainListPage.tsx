import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import { useDecisionDomains } from '../hooks/useDecisionDomains';
import { DomainFormModal } from '../components/DomainFormModal';
import type { DecisionDomain } from '../contracts/types';
import './DomainListPage.css';

export function DomainListPage() {
    const { domains, loading, refetch } = useDecisionDomains();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [editDomain, setEditDomain] = useState<DecisionDomain | null>(null);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete domain "${name}" and all its scopes and rules?`)) return;
        await fetch(`/api/domains/${id}`, { method: 'DELETE' });
        refetch();
    };

    if (loading) return <div className="page-loading">Loading domains…</div>;

    return (
        <div className="domain-list-page">
            <div className="page-header-row">
                <h2>Decision Domains</h2>
                <div className="page-header-btns">
                    <button className="btn-export" onClick={() => navigate('/manifests/all')} disabled={domains.length === 0}>
                        <DownloadIcon fontSize="small" /> Export All
                    </button>
                    <button className="btn-primary" onClick={() => { setEditDomain(null); setModalOpen(true); }}>
                        <AddIcon fontSize="small" /> New Domain
                    </button>
                </div>
            </div>

            <div className="domain-grid">
                {domains.map((d) => (
                    <div
                        key={d.id}
                        className={`domain-card ${d.issueCount > 0 ? 'has-issues' : ''}`}
                        onClick={() => navigate(`/domains/${d.id}`)}
                    >
                        <div className="card-actions">
                            <button onClick={(e) => { e.stopPropagation(); setEditDomain(d); setModalOpen(true); }} title="Edit">
                                <EditIcon fontSize="small" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id, d.name); }} title="Delete">
                                <DeleteIcon fontSize="small" />
                            </button>
                        </div>

                        <div className="card-header">
                            {d.issueCount === 0
                                ? <CheckCircleOutlineIcon className="health-ok" />
                                : <WarningAmberIcon className="health-warn" />
                            }
                            <h3>{d.name}</h3>
                        </div>

                        {d.description && <p className="card-desc">{d.description}</p>}

                        <div className="card-stats">
                            <span>{d.scopeCount} scope{d.scopeCount !== 1 ? 's' : ''}</span>
                            <span className="stat-sep">·</span>
                            <span>{d.ruleCount} rule{d.ruleCount !== 1 ? 's' : ''}</span>
                            <span className="stat-sep">·</span>
                            <span>v{d.version}</span>
                        </div>

                        {d.issueCount > 0 && (
                            <div className="card-issues">
                                {d.issues.map((issue, i) => (
                                    <span key={i} className="issue-tag">{issue}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <DomainFormModal
                open={modalOpen}
                domain={editDomain}
                onClose={() => setModalOpen(false)}
                onSaved={() => { setModalOpen(false); refetch(); }}
            />
        </div>
    );
}
