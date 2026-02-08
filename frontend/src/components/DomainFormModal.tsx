import { useState, useEffect } from 'react';
import type { DecisionDomain } from '../contracts/types';
import './DomainFormModal.css';

interface DomainFormModalProps {
    open: boolean;
    domain?: DecisionDomain | null;
    onClose: () => void;
    onSaved: () => void;
}

export function DomainFormModal({ open, domain, onClose, onSaved }: DomainFormModalProps) {
    const isEdit = !!domain;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [version, setVersion] = useState('1.0.0');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setName(domain?.name || '');
            setDescription(domain?.description || '');
            setVersion(domain?.version || '1.0.0');
            setError('');
        }
    }, [open, domain]);

    if (!open) return null;

    const handleSave = async () => {
        if (!name.trim()) { setError('Name is required'); return; }
        setError('');

        try {
            const url = isEdit ? `/api/domains/${domain!.id}` : '/api/domains';
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), description: description.trim() || null, version }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Save failed');
                return;
            }
            onSaved();
        } catch {
            setError('Network error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{isEdit ? 'Edit Domain' : 'New Decision Domain'}</h3>

                <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Storage.Slotting" autoFocus />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What decisions does this domain govern?" />
                </div>

                <div className="form-group">
                    <label>Version</label>
                    <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="modal-actions">
                    <button className="btn-primary" onClick={handleSave}>{isEdit ? 'Update' : 'Create'}</button>
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
