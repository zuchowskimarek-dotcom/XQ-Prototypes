import { useState, useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useSchema } from '../hooks/useSchema';
import './SchemaEditorPage.css';

export function SchemaEditorPage() {
    const { schemaText, isFactory, loading, saving, error, save, reset } = useSchema();
    const [editorValue, setEditorValue] = useState<string>('');
    const [dirty, setDirty] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<any>(null);

    // Sync editor when schema loads (only on initial load / reset)
    const lastSchemaRef = useRef<string>('');
    if (schemaText && schemaText !== lastSchemaRef.current) {
        lastSchemaRef.current = schemaText;
        setEditorValue(schemaText);
        setDirty(false);
    }

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    const handleEditorChange = useCallback((value: string | undefined) => {
        const v = value ?? '';
        setEditorValue(v);
        setDirty(v !== lastSchemaRef.current);
        setSaveMsg(null);
        setConfirmReset(false);
    }, []);

    const handleSave = async () => {
        try {
            JSON.parse(editorValue);
        } catch {
            setSaveMsg('❌ Invalid JSON — please fix syntax errors before saving');
            return;
        }
        const result = await save(editorValue);
        if (result.success) {
            lastSchemaRef.current = editorValue;
            setDirty(false);
            setSaveMsg('✅ Schema saved & compiled successfully');
        } else {
            setSaveMsg(`❌ ${result.error}`);
        }
    };

    const handleReset = async () => {
        if (!confirmReset) {
            setConfirmReset(true);
            return;
        }
        setConfirmReset(false);
        const result = await reset();
        if (result.success) {
            setSaveMsg('✅ Schema reset to factory default');
        }
    };

    const handleCancelReset = () => {
        setConfirmReset(false);
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            try {
                const parsed = JSON.parse(text);
                const formatted = JSON.stringify(parsed, null, 2);
                setEditorValue(formatted);
                setDirty(true);
                setSaveMsg('📄 Schema imported — review and click Save to apply');
            } catch {
                setSaveMsg('❌ Imported file is not valid JSON');
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be re-imported
        e.target.value = '';
    };

    const handleExport = () => {
        const blob = new Blob([editorValue], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'policyManifestSchema.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="page-loading">Loading schema…</div>;

    return (
        <div className="schema-editor-page">
            <div className="schema-toolbar">
                <div className="schema-toolbar-left">
                    <h2>§8.12 JSON Schema</h2>
                    <span className={`schema-badge ${isFactory ? 'factory' : 'custom'}`}>
                        {isFactory ? 'Factory Default' : 'Custom'}
                    </span>
                    {dirty && <span className="schema-dirty-dot" title="Unsaved changes" />}
                </div>
                <div className="schema-toolbar-right">
                    <button className="btn btn-secondary" onClick={handleImport}>
                        Import
                    </button>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        Export
                    </button>
                    {confirmReset ? (
                        <>
                            <button className="btn btn-danger" onClick={handleReset} disabled={saving}>
                                Confirm Reset
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelReset}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-warning" onClick={handleReset} disabled={saving}>
                            Reset to Factory
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>
                        {saving ? 'Saving…' : 'Save'}
                        {dirty && <span className="save-dot" />}
                    </button>
                </div>
            </div>

            {(saveMsg || error) && (
                <div className={`schema-message ${(saveMsg || error || '').startsWith('✅') ? 'success' : (saveMsg || error || '').startsWith('📄') ? 'info' : 'error'}`}>
                    {saveMsg || error}
                </div>
            )}

            <div className="schema-editor-container">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={editorValue}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    theme="vs-dark"
                    options={{
                        fontSize: 13,
                        minimap: { enabled: true },
                        wordWrap: 'on',
                        formatOnPaste: true,
                        tabSize: 2,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
        </div>
    );
}
