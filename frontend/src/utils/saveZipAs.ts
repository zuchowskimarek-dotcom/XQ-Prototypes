/**
 * Download a zip file from an API endpoint using the File System Access API.
 * Shows a native "Save As" dialog so the user can pick the target location.
 * Falls back to <a download> for browsers without File System Access API.
 */
export async function saveZipAs(url: string, suggestedName: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(err.error || `Export failed (${res.status})`);
    }

    const blob = await res.blob();

    // Try File System Access API (Chrome, Edge, Opera)
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await (window as any).showSaveFilePicker({
                suggestedName,
                types: [
                    {
                        description: 'ZIP Archive',
                        accept: { 'application/zip': ['.zip'] },
                    },
                ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (e: any) {
            // User cancelled the dialog — that's fine
            if (e.name === 'AbortError') return;
            throw e;
        }
    }

    // Fallback: classic <a download> (Firefox, Safari)
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
}
