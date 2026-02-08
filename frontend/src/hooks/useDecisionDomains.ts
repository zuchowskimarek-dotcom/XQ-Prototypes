import { useState, useEffect, useCallback } from 'react';
import type { DecisionDomain } from '../contracts/types';

export function useDecisionDomains() {
    const [domains, setDomains] = useState<DecisionDomain[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/domains');
            const data = await res.json();
            setDomains(data);
        } catch (e) {
            console.error('Failed to fetch domains', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refetch(); }, [refetch]);

    return { domains, loading, refetch };
}
