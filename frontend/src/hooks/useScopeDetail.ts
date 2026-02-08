import { useState, useEffect, useCallback, useRef } from 'react';
import type { DecisionScopeDetail } from '../contracts/types';

export function useScopeDetail(id: string | undefined) {
    const [scope, setScope] = useState<DecisionScopeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const initialLoadDone = useRef(false);

    const refetch = useCallback(async () => {
        if (!id) return;
        // Only show loading spinner on initial load, not on refetches
        if (!initialLoadDone.current) {
            setLoading(true);
        }
        try {
            const res = await fetch(`/api/scopes/${id}`);
            const data = await res.json();
            setScope(data);
        } catch (e) {
            console.error('Failed to fetch scope detail', e);
        } finally {
            setLoading(false);
            initialLoadDone.current = true;
        }
    }, [id]);

    useEffect(() => {
        initialLoadDone.current = false;
        refetch();
    }, [refetch]);

    return { scope, loading, refetch };
}
