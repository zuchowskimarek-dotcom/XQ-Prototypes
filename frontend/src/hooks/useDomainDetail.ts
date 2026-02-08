import { useState, useEffect, useCallback } from 'react';
import type { DecisionDomainDetail } from '../contracts/types';

export function useDomainDetail(id: string | undefined) {
    const [domain, setDomain] = useState<DecisionDomainDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/domains/${id}`);
            const data = await res.json();
            setDomain(data);
        } catch (e) {
            console.error('Failed to fetch domain detail', e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { refetch(); }, [refetch]);

    return { domain, loading, refetch };
}
