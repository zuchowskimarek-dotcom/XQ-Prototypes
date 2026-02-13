import { useState, useCallback, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import './ImportRulesModal.css';

interface ImportRulesModalProps {
    domainId: string;
    domainName: string;
    onClose: () => void;
    onSuccess: () => void;
}

const PLACEHOLDER = `{
  "contentsByScope": {
    "Scope.Name": [
      {
        "contextFilter": {},
        "strategy": {
          "id": "strategy-id",
          "name": "Strategy.Name",
          "description": "Strategy description",
          "parameters": {
            "ParamName": { "id": "ParamName", "type": "int" }
          }
        },
        "policies": [
          {
            "id": "policy-id",
            "name": "Policy.Name",
            "description": "Policy description",
            "parameters": {}
          }
        ],
        "ruleParameters": [
          {
            "id": "ParamName",
            "type": "int",
            "description": "Parameter description",
            "value": 10
          }
        ]
      }
    ]
  }
}`;

export function ImportRulesModal({ domainId, domainName, onClose, onSuccess }: ImportRulesModalProps) {
    const [editorValue, setEditorValue] = useState(PLACEHOLDER);
    const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success' | 'validating'; message: string }>({
        type: 'idle',
        message: 'Paste a manifest JSON or edit the template above, then click Import.',
    });
    const [importing, setImporting] = useState(false);
    const editorRef = useRef<any>(null);

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
        // Focus the editor
        editor.focus();
    };

    const handleEditorChange = useCallback((value: string | undefined) => {
        setEditorValue(value ?? '');
        // Reset status when editing
        if (status.type !== 'idle') {
            setStatus({ type: 'idle', message: 'Ready to validate and import.' });
        }
    }, [status.type]);

    const handleImport = async () => {
        // 1. Parse JSON
        let parsed: any;
        try {
            parsed = JSON.parse(editorValue);
        } catch {
            setStatus({ type: 'error', message: '❌ Invalid JSON — please fix syntax errors.' });
            return;
        }

        // 2. Send to backend
        setImporting(true);
        setStatus({ type: 'validating', message: '⏳ Validating and importing…' });

        try {
            const res = await fetch(`/api/domains/${domainId}/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
            });

            const data = await res.json();

            if (!res.ok) {
                // Schema validation errors
                if (data.validationErrors && data.validationErrors.length > 0) {
                    const errorLines = data.validationErrors
                        .slice(0, 10)
                        .map((e: any) => `  • ${e.path || '/'}: ${e.message}`)
                        .join('\n');
                    const suffix = data.validationErrors.length > 10
                        ? `\n  … and ${data.validationErrors.length - 10} more`
                        : '';
                    setStatus({
                        type: 'error',
                        message: `❌ Schema validation failed:\n${errorLines}${suffix}`,
                    });
                } else {
                    setStatus({ type: 'error', message: `❌ ${data.error || 'Import failed'}` });
                }
                return;
            }

            // Success
            const { imported } = data;
            setStatus({
                type: 'success',
                message: `✅ Import complete — ${imported.scopes} scope(s), ${imported.rules} rule(s), ${imported.strategies} strategy(ies), ${imported.policies} policy(ies), ${imported.parameters} parameter(s)`,
            });

            // Auto-close after short delay
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (e) {
            setStatus({ type: 'error', message: `❌ Network error: ${String(e)}` });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="import-modal-overlay" onClick={onClose}>
            <div className="import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="import-modal-header">
                    <div>
                        <h2>Import Rules</h2>
                        <span className="import-domain-name">{domainName}</span>
                    </div>
                    <button className="import-close-btn" onClick={onClose} title="Close">✕</button>
                </div>

                <div className="import-editor-container">
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        value={editorValue}
                        onChange={handleEditorChange}
                        onMount={handleEditorMount}
                        theme="vs-dark"
                        options={{
                            fontSize: 13,
                            minimap: { enabled: false },
                            wordWrap: 'on',
                            formatOnPaste: true,
                            tabSize: 2,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            bracketPairColorization: { enabled: true },
                            lineNumbers: 'on',
                            renderLineHighlight: 'all',
                            padding: { top: 12 },
                        }}
                    />
                </div>

                <div className={`import-status ${status.type}`}>
                    <pre>{status.message}</pre>
                </div>

                <div className="import-modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={importing}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleImport}
                        disabled={importing || status.type === 'success'}
                    >
                        {importing ? 'Importing…' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}
