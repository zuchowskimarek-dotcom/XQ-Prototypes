import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useScopeDetail } from '../hooks/useScopeDetail';
import { RuleEditorDrawer } from '../components/RuleEditorDrawer';
import type { PolicyRule } from '../contracts/types';
import './ScopeEditorPage.css';

/** Render a context filter as readable text */
function renderFilter(cf: Record<string, string>): string {
    const keys = Object.keys(cf);
    if (keys.length === 0) return 'Global';
    return keys.map((k) => `${k} = ${cf[k]}`).join(', ');
}

export function ScopeEditorPage() {
    const { domainId, scopeId } = useParams<{ domainId: string; scopeId: string }>();
    const { scope, loading, refetch } = useScopeDetail(scopeId);
    const [editingRule, setEditingRule] = useState<PolicyRule | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleAddRule = async () => {
        if (!scopeId) return;
        const res = await fetch('/api/rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scopeId, contextFilter: {} }),
        });
        if (res.ok) {
            const newRule = await res.json();
            refetch();
            setEditingRule(newRule);
            setDrawerOpen(true);
        }
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm('Delete this rule and all its policies, strategy, and parameters?')) return;
        await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
        refetch();
    };

    const handleEditRule = (rule: PolicyRule) => {
        setEditingRule(rule);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setEditingRule(null);
        refetch();
    };

    if (loading || !scope) return <div className="page-loading">Loading…</div>;

    const sortedRules = [...scope.rules].sort((a, b) => a.specificityScore - b.specificityScore);

    return (
        <div className="scope-editor-page">
            <Link to={`/domains/${domainId}`} className="back-link">
                <ArrowBackIcon fontSize="small" /> Back to Domain
            </Link>

            <div className="page-header-row">
                <div>
                    <h2>{scope.name}</h2>
                    {scope.description && <p className="scope-desc">{scope.description}</p>}
                </div>
                <button className="btn-primary" onClick={handleAddRule}>
                    <AddIcon fontSize="small" /> Add Rule
                </button>
            </div>

            <div className="rule-table-container">
                <table className="rule-table">
                    <thead>
                        <tr>
                            <th>Context Filter</th>
                            <th>Strategy</th>
                            <th>Policies</th>
                            <th>Parameters</th>
                            <th className="col-specificity">Specificity</th>
                            <th className="col-status">Status</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedRules.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="empty-row">
                                    No rules defined. Add a rule to configure this decision scope.
                                </td>
                            </tr>
                        ) : (
                            sortedRules.map((rule) => {
                                const issues = rule.issues || [];
                                const isValid = issues.length === 0;

                                return (
                                    <tr key={rule.id} className={!isValid ? 'row-invalid' : ''}>
                                        <td className="cell-filter">
                                            <span className={Object.keys(rule.contextFilter).length === 0 ? 'filter-global' : 'filter-specific'}>
                                                {renderFilter(rule.contextFilter)}
                                            </span>
                                        </td>
                                        <td className="cell-strategy">
                                            {rule.strategy
                                                ? <span className="strategy-name">{rule.strategy.name}</span>
                                                : <span className="strategy-missing">— none —</span>
                                            }
                                        </td>
                                        <td className="cell-policies">
                                            {rule.policies.length > 0
                                                ? rule.policies.map((p) => (
                                                    <span key={p.id} className="policy-chip">{p.name}</span>
                                                ))
                                                : <span className="empty-cell">—</span>
                                            }
                                        </td>
                                        <td className="cell-params">
                                            {rule.systemParameters.length > 0
                                                ? <span className="param-count">{rule.systemParameters.length} param{rule.systemParameters.length !== 1 ? 's' : ''}</span>
                                                : <span className="empty-cell">—</span>
                                            }
                                        </td>
                                        <td className="col-specificity">
                                            <span className="specificity-badge">{rule.specificityScore}</span>
                                        </td>
                                        <td className="col-status">
                                            {isValid
                                                ? <CheckCircleOutlineIcon className="status-ok" />
                                                : <span className="status-warn-group" title={issues.join('\n')}>
                                                    <WarningAmberIcon className="status-warn" />
                                                    <span className="status-issue-count">{issues.length}</span>
                                                </span>
                                            }
                                        </td>
                                        <td className="col-actions">
                                            <button className="action-btn" onClick={() => handleEditRule(rule)} title="Edit rule">
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button className="action-btn action-delete" onClick={() => handleDeleteRule(rule.id)} title="Delete rule">
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {drawerOpen && editingRule && (
                <RuleEditorDrawer
                    rule={editingRule}
                    onClose={handleDrawerClose}
                    onRefresh={refetch}
                />
            )}
        </div>
    );
}
