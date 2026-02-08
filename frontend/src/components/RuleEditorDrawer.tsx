import { useState, useEffect, useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Close';
import type { PolicyRule } from '../contracts/types';
import './RuleEditorDrawer.css';

const AVAILABLE_DIMENSIONS = [
    'processRef', 'eoType', 'plantArea', 'zone', 'aisle', 'huType', 'storageType', 'shift', 'triggerType', 'selectionMode',
];

interface RuleEditorDrawerProps {
    rule: PolicyRule;
    onClose: () => void;
    onRefresh: () => void;
}

export function RuleEditorDrawer({ rule: initialRule, onClose, onRefresh }: RuleEditorDrawerProps) {
    const [rule, setRule] = useState<PolicyRule>(initialRule);
    const [filterEditing, setFilterEditing] = useState(false);
    const [localFilter, setLocalFilter] = useState<Record<string, string>>({});

    // New entity forms
    const [newPolicyName, setNewPolicyName] = useState('');
    const [newStrategyName, setNewStrategyName] = useState('');
    const [newParamId, setNewParamId] = useState('');
    const [newParamType, setNewParamType] = useState('string');
    const [newParamValue, setNewParamValue] = useState('');
    const [newDimension, setNewDimension] = useState('');

    // Inline editing state
    const [editingStrategyName, setEditingStrategyName] = useState<string | null>(null);
    const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
    const [editingPolicyName, setEditingPolicyName] = useState('');
    const [editingParamDbId, setEditingParamDbId] = useState<string | null>(null);
    const [editingParamType, setEditingParamType] = useState('');
    const [editingParamValue, setEditingParamValue] = useState('');

    // Policy parameter CRUD state
    const [addingPolicyParamFor, setAddingPolicyParamFor] = useState<string | null>(null);
    const [newPolicyParamKey, setNewPolicyParamKey] = useState('');
    const [newPolicyParamType, setNewPolicyParamType] = useState('string');
    const [newPolicyParamValue, setNewPolicyParamValue] = useState('');
    const [editingPolicyParamKey, setEditingPolicyParamKey] = useState<{ policyId: string; key: string } | null>(null);
    const [editPolicyParamType, setEditPolicyParamType] = useState('');
    const [editPolicyParamValue, setEditPolicyParamValue] = useState('');

    // Refetch ONLY the drawer's rule — does NOT trigger parent refetch.
    // Parent table syncs when drawer closes via onClose → handleDrawerClose.
    const refetchRule = useCallback(async () => {
        const res = await fetch(`/api/rules/${initialRule.id}`);
        if (res.ok) {
            const data = await res.json();
            setRule(data);
        }
    }, [initialRule.id]);

    useEffect(() => {
        setRule(initialRule);
        setLocalFilter({ ...initialRule.contextFilter });
    }, [initialRule]);

    // Sync parent table when drawer closes
    const handleClose = () => {
        onRefresh();
        onClose();
    };

    // ─── Context Filter ───

    const startFilterEdit = () => {
        setLocalFilter({ ...rule.contextFilter });
        setFilterEditing(true);
    };

    const saveFilter = async () => {
        await fetch(`/api/rules/${rule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contextFilter: localFilter }),
        });
        setFilterEditing(false);
        refetchRule();
    };

    const cancelFilterEdit = () => {
        setLocalFilter({ ...rule.contextFilter });
        setFilterEditing(false);
    };

    const addDimension = () => {
        if (!newDimension || localFilter[newDimension] !== undefined) return;
        setLocalFilter({ ...localFilter, [newDimension]: '' });
        setNewDimension('');
    };

    const removeDimension = (key: string) => {
        const next = { ...localFilter };
        delete next[key];
        setLocalFilter(next);
    };

    const updateDimensionValue = (key: string, value: string) => {
        setLocalFilter({ ...localFilter, [key]: value });
    };

    // ─── Strategy ───

    const setStrategy = async () => {
        if (!newStrategyName.trim()) return;
        await fetch(`/api/rules/${rule.id}/strategy`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newStrategyName.trim() }),
        });
        setNewStrategyName('');
        refetchRule();
    };

    const clearStrategy = async () => {
        await fetch(`/api/rules/${rule.id}/strategy`, { method: 'DELETE' });
        refetchRule();
    };

    const startEditStrategy = () => {
        if (!rule.strategy) return;
        setEditingStrategyName(rule.strategy.name);
    };

    const saveEditStrategy = async () => {
        if (!editingStrategyName?.trim()) return;
        await fetch(`/api/rules/${rule.id}/strategy`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editingStrategyName.trim() }),
        });
        setEditingStrategyName(null);
        refetchRule();
    };

    const cancelEditStrategy = () => {
        setEditingStrategyName(null);
    };

    // ─── Policies ───

    const addPolicy = async () => {
        if (!newPolicyName.trim()) return;
        await fetch(`/api/rules/${rule.id}/policies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newPolicyName.trim() }),
        });
        setNewPolicyName('');
        refetchRule();
    };

    const removePolicy = async (policyId: string) => {
        await fetch(`/api/rules/${rule.id}/policies/${policyId}`, { method: 'DELETE' });
        refetchRule();
    };

    const startEditPolicy = (policyId: string, currentName: string) => {
        setEditingPolicyId(policyId);
        setEditingPolicyName(currentName);
    };

    const saveEditPolicy = async () => {
        if (!editingPolicyId || !editingPolicyName.trim()) return;
        await fetch(`/api/rules/${rule.id}/policies/${editingPolicyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editingPolicyName.trim() }),
        });
        setEditingPolicyId(null);
        setEditingPolicyName('');
        refetchRule();
    };

    const cancelEditPolicy = () => {
        setEditingPolicyId(null);
        setEditingPolicyName('');
    };

    // ─── Policy Parameter CRUD (embedded JSON) ───

    const updatePolicyParams = async (policyId: string, params: Record<string, unknown>) => {
        await fetch(`/api/rules/${rule.id}/policies/${policyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parameters: params }),
        });
        refetchRule();
    };

    const addPolicyParam = async (policyId: string) => {
        if (!newPolicyParamKey.trim()) return;
        const policy = rule.policies.find(p => p.id === policyId);
        if (!policy) return;
        const updated = { ...policy.parameters, [newPolicyParamKey.trim()]: { id: newPolicyParamKey.trim(), type: newPolicyParamType, value: newPolicyParamType === 'int' || newPolicyParamType === 'decimal' ? Number(newPolicyParamValue) : newPolicyParamValue } };
        await updatePolicyParams(policyId, updated);
        setNewPolicyParamKey(''); setNewPolicyParamValue(''); setNewPolicyParamType('string');
        setAddingPolicyParamFor(null);
    };

    const deletePolicyParam = async (policyId: string, paramKey: string) => {
        const policy = rule.policies.find(p => p.id === policyId);
        if (!policy) return;
        const updated = { ...policy.parameters };
        delete updated[paramKey];
        await updatePolicyParams(policyId, updated);
    };

    const startEditPolicyParam = (policyId: string, key: string, param: { type: string; value: unknown }) => {
        setEditingPolicyParamKey({ policyId, key });
        setEditPolicyParamType(param.type);
        setEditPolicyParamValue(String(param.value ?? ''));
    };

    const saveEditPolicyParam = async () => {
        if (!editingPolicyParamKey) return;
        const { policyId, key } = editingPolicyParamKey;
        const policy = rule.policies.find(p => p.id === policyId);
        if (!policy) return;
        const value = editPolicyParamType === 'int' || editPolicyParamType === 'decimal' ? Number(editPolicyParamValue) : editPolicyParamValue;
        const updated = { ...policy.parameters, [key]: { id: key, type: editPolicyParamType, value } };
        await updatePolicyParams(policyId, updated);
        setEditingPolicyParamKey(null);
    };

    const cancelEditPolicyParam = () => {
        setEditingPolicyParamKey(null);
    };

    // ─── Parameters ───

    const addParameter = async () => {
        if (!newParamId.trim()) return;
        await fetch(`/api/rules/${rule.id}/parameters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paramId: newParamId.trim(), type: newParamType, value: newParamValue }),
        });
        setNewParamId(''); setNewParamValue('');
        refetchRule();
    };

    const removeParameter = async (paramId: string) => {
        await fetch(`/api/rules/${rule.id}/parameters/${paramId}`, { method: 'DELETE' });
        refetchRule();
    };

    const startEditParam = (p: { id: string; type: string; value?: string | null }) => {
        setEditingParamDbId(p.id);
        setEditingParamType(p.type);
        setEditingParamValue(p.value ?? '');
    };

    const saveEditParam = async () => {
        if (!editingParamDbId) return;
        await fetch(`/api/rules/${rule.id}/parameters/${editingParamDbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: editingParamType, value: editingParamValue }),
        });
        setEditingParamDbId(null);
        refetchRule();
    };

    const cancelEditParam = () => {
        setEditingParamDbId(null);
    };

    const usedDimensions = Object.keys(localFilter);
    const availableDimensions = AVAILABLE_DIMENSIONS.filter((d) => !usedDimensions.includes(d));
    const filterEntries = Object.entries(filterEditing ? localFilter : rule.contextFilter);

    return (
        <div className="drawer-overlay" onClick={handleClose}>
            <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                    <h3>Edit Policy Rule</h3>
                    <button className="drawer-close" onClick={handleClose}><CloseIcon /></button>
                </div>

                <div className="drawer-body">
                    {/* ─── Context Filter Section ─── */}
                    <section className="editor-section">
                        <div className="section-header">
                            <h4>Context Filter</h4>
                            {!filterEditing && (
                                <button className="btn-edit" onClick={startFilterEdit}>Edit</button>
                            )}
                        </div>

                        {filterEntries.length === 0 && (
                            <span className="global-badge">Global</span>
                        )}

                        {filterEntries.map(([key, value]) => (
                            <div key={key} className="filter-row">
                                <span className="filter-key">{key}</span>
                                {filterEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            className="filter-value-input"
                                            value={value}
                                            onChange={(e) => updateDimensionValue(key, e.target.value)}
                                            placeholder="value"
                                        />
                                        <button className="btn-icon-sm" onClick={() => removeDimension(key)}>
                                            <DeleteIcon fontSize="small" />
                                        </button>
                                    </>
                                ) : (
                                    <span className="filter-value">{value || '(empty)'}</span>
                                )}
                            </div>
                        ))}

                        {filterEditing && (
                            <>
                                <div className="add-dimension-row">
                                    <select value={newDimension} onChange={(e) => setNewDimension(e.target.value)}>
                                        <option value="">Add dimension…</option>
                                        {availableDimensions.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <button className="btn-icon-sm" onClick={addDimension} disabled={!newDimension}>
                                        <AddIcon fontSize="small" />
                                    </button>
                                </div>
                                <div className="filter-actions">
                                    <button className="btn-primary btn-sm" onClick={saveFilter}>Save Filter</button>
                                    <button className="btn-secondary btn-sm" onClick={cancelFilterEdit}>Cancel</button>
                                </div>
                            </>
                        )}
                    </section>

                    {/* ─── Strategy Section ─── */}
                    <section className="editor-section">
                        <div className="section-header">
                            <h4>Strategy</h4>
                            <span className={`strategy-status ${rule.strategy ? 'ok' : 'warn'}`}>
                                {rule.strategy ? '✓ Set' : '⚠ Required'}
                            </span>
                        </div>

                        {rule.strategy ? (
                            <div className="current-strategy">
                                {editingStrategyName !== null ? (
                                    <div className="inline-edit-row">
                                        <input
                                            type="text"
                                            className="inline-edit-input"
                                            value={editingStrategyName}
                                            onChange={(e) => setEditingStrategyName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditStrategy(); if (e.key === 'Escape') cancelEditStrategy(); }}
                                            autoFocus
                                        />
                                        <button className="btn-icon-sm btn-confirm" onClick={saveEditStrategy} title="Save"><CheckIcon fontSize="small" /></button>
                                        <button className="btn-icon-sm btn-cancel" onClick={cancelEditStrategy} title="Cancel"><CancelIcon fontSize="small" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="strategy-name">{rule.strategy.name}</span>
                                        <button className="btn-icon-sm" onClick={startEditStrategy} title="Edit">
                                            <EditIcon fontSize="small" />
                                        </button>
                                        <button className="btn-icon-sm" onClick={clearStrategy} title="Remove">
                                            <DeleteIcon fontSize="small" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="add-entity-row">
                                <input
                                    type="text"
                                    value={newStrategyName}
                                    onChange={(e) => setNewStrategyName(e.target.value)}
                                    placeholder="Strategy name"
                                    onKeyDown={(e) => e.key === 'Enter' && setStrategy()}
                                />
                                <button className="btn-icon-sm" onClick={setStrategy} disabled={!newStrategyName.trim()}>
                                    <AddIcon fontSize="small" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* ─── Policies Section ─── */}
                    <section className="editor-section">
                        <div className="section-header">
                            <h4>Policies</h4>
                            <span className="count-badge">{rule.policies.length}</span>
                        </div>

                        {rule.policies.map((p) => (
                            <div key={p.id} className="entity-row">
                                {editingPolicyId === p.id ? (
                                    <div className="inline-edit-row">
                                        <input
                                            type="text"
                                            className="inline-edit-input"
                                            value={editingPolicyName}
                                            onChange={(e) => setEditingPolicyName(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditPolicy(); if (e.key === 'Escape') cancelEditPolicy(); }}
                                            autoFocus
                                        />
                                        <button className="btn-icon-sm btn-confirm" onClick={saveEditPolicy} title="Save"><CheckIcon fontSize="small" /></button>
                                        <button className="btn-icon-sm btn-cancel" onClick={cancelEditPolicy} title="Cancel"><CancelIcon fontSize="small" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span>{p.name}</span>
                                        <div className="entity-actions">
                                            <button className="btn-icon-sm" onClick={() => startEditPolicy(p.id, p.name)} title="Edit">
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button className="btn-icon-sm" onClick={() => removePolicy(p.id)} title="Delete">
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </>
                                )}
                                {/* ─── Policy Parameters (embedded JSON CRUD) ─── */}
                                <div className="policy-params">
                                    {p.parameters && Object.entries(p.parameters).map(([key, param]) => (
                                        <div key={key} className="policy-param-row">
                                            {editingPolicyParamKey?.policyId === p.id && editingPolicyParamKey?.key === key ? (
                                                <>
                                                    <span className="param-id">{key}</span>
                                                    <select value={editPolicyParamType} onChange={(e) => setEditPolicyParamType(e.target.value)} className="pp-select">
                                                        <option value="string">string</option>
                                                        <option value="int">int</option>
                                                        <option value="decimal">decimal</option>
                                                        <option value="bool">bool</option>
                                                        <option value="enum">enum</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        className="inline-edit-input pp-value-input"
                                                        value={editPolicyParamValue}
                                                        onChange={(e) => setEditPolicyParamValue(e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') saveEditPolicyParam(); if (e.key === 'Escape') cancelEditPolicyParam(); }}
                                                        autoFocus
                                                    />
                                                    <button className="btn-icon-sm btn-confirm" onClick={saveEditPolicyParam} title="Save"><CheckIcon fontSize="small" /></button>
                                                    <button className="btn-icon-sm btn-cancel" onClick={cancelEditPolicyParam} title="Cancel"><CancelIcon fontSize="small" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="param-id">{key}</span>
                                                    <span className="param-type">{(param as any).type}</span>
                                                    <span className="param-value">{String((param as any).value ?? '—')}</span>
                                                    <div className="entity-actions">
                                                        <button className="btn-icon-sm" onClick={() => startEditPolicyParam(p.id, key, param as any)} title="Edit">
                                                            <EditIcon style={{ fontSize: 14 }} />
                                                        </button>
                                                        <button className="btn-icon-sm" onClick={() => deletePolicyParam(p.id, key)} title="Delete">
                                                            <DeleteIcon style={{ fontSize: 14 }} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {/* Add policy parameter form */}
                                    {addingPolicyParamFor === p.id ? (
                                        <div className="policy-param-row pp-add-form">
                                            <input type="text" className="inline-edit-input pp-key-input" value={newPolicyParamKey} onChange={(e) => setNewPolicyParamKey(e.target.value)} placeholder="paramKey" />
                                            <select value={newPolicyParamType} onChange={(e) => setNewPolicyParamType(e.target.value)} className="pp-select">
                                                <option value="string">string</option>
                                                <option value="int">int</option>
                                                <option value="decimal">decimal</option>
                                                <option value="bool">bool</option>
                                                <option value="enum">enum</option>
                                            </select>
                                            <input type="text" className="inline-edit-input pp-value-input" value={newPolicyParamValue} onChange={(e) => setNewPolicyParamValue(e.target.value)} placeholder="value" onKeyDown={(e) => e.key === 'Enter' && addPolicyParam(p.id)} />
                                            <button className="btn-icon-sm btn-confirm" onClick={() => addPolicyParam(p.id)} title="Add" disabled={!newPolicyParamKey.trim()}><CheckIcon fontSize="small" /></button>
                                            <button className="btn-icon-sm btn-cancel" onClick={() => setAddingPolicyParamFor(null)} title="Cancel"><CancelIcon fontSize="small" /></button>
                                        </div>
                                    ) : (
                                        <button className="btn-add-pp" onClick={() => { setAddingPolicyParamFor(p.id); setNewPolicyParamKey(''); setNewPolicyParamValue(''); setNewPolicyParamType('string'); }}>
                                            <AddIcon style={{ fontSize: 14 }} /> Add Parameter
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="add-entity-row">
                            <input
                                type="text"
                                value={newPolicyName}
                                onChange={(e) => setNewPolicyName(e.target.value)}
                                placeholder="Policy name"
                                onKeyDown={(e) => e.key === 'Enter' && addPolicy()}
                            />
                            <button className="btn-icon-sm" onClick={addPolicy} disabled={!newPolicyName.trim()}>
                                <AddIcon fontSize="small" />
                            </button>
                        </div>
                    </section>

                    {/* ─── Parameters Section ─── */}
                    <section className="editor-section">
                        <div className="section-header">
                            <h4>System Parameters</h4>
                            <span className="count-badge">{rule.systemParameters.length}</span>
                        </div>

                        {rule.systemParameters.map((p) => (
                            <div key={p.id} className="param-row">
                                {editingParamDbId === p.id ? (
                                    <div className="inline-edit-row param-edit-fields">
                                        <span className="param-id">{p.paramId}</span>
                                        <select value={editingParamType} onChange={(e) => setEditingParamType(e.target.value)}>
                                            <option value="string">string</option>
                                            <option value="int">int</option>
                                            <option value="decimal">decimal</option>
                                            <option value="bool">bool</option>
                                            <option value="enum">enum</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="inline-edit-input"
                                            value={editingParamValue}
                                            onChange={(e) => setEditingParamValue(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEditParam(); if (e.key === 'Escape') cancelEditParam(); }}
                                            placeholder="value"
                                            autoFocus
                                        />
                                        <button className="btn-icon-sm btn-confirm" onClick={saveEditParam} title="Save"><CheckIcon fontSize="small" /></button>
                                        <button className="btn-icon-sm btn-cancel" onClick={cancelEditParam} title="Cancel"><CancelIcon fontSize="small" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="param-id">{p.paramId}</span>
                                        <span className="param-type">{p.type}</span>
                                        <span className="param-value">{p.value ?? '—'}</span>
                                        <div className="entity-actions">
                                            <button className="btn-icon-sm" onClick={() => startEditParam(p)} title="Edit">
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button className="btn-icon-sm" onClick={() => removeParameter(p.id)} title="Delete">
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="add-param-row">
                            <input type="text" value={newParamId} onChange={(e) => setNewParamId(e.target.value)} placeholder="paramId" />
                            <select value={newParamType} onChange={(e) => setNewParamType(e.target.value)}>
                                <option value="string">string</option>
                                <option value="int">int</option>
                                <option value="decimal">decimal</option>
                                <option value="bool">bool</option>
                                <option value="enum">enum</option>
                            </select>
                            <input type="text" value={newParamValue} onChange={(e) => setNewParamValue(e.target.value)} placeholder="value" />
                            <button className="btn-icon-sm" onClick={addParameter} disabled={!newParamId.trim()}>
                                <AddIcon fontSize="small" />
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
