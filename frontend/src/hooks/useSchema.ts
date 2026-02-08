import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = '/api/schema';

interface SchemaState {
    schema: Record<string, unknown> | null;
    schemaText: string;
    isFactory: boolean;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

export function useSchema() {
    const [state, setState] = useState<SchemaState>({
        schema: null,
        schemaText: '',
        isFactory: true,
        loading: true,
        saving: false,
        error: null,
    });

    const fetchSchema = useCallback(async () => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const { data } = await axios.get(API);
            const text = JSON.stringify(data.schema, null, 2);
            setState({
                schema: data.schema,
                schemaText: text,
                isFactory: data.isFactory,
                loading: false,
                saving: false,
                error: null,
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to load schema';
            setState((s) => ({ ...s, loading: false, error: msg }));
        }
    }, []);

    useEffect(() => {
        fetchSchema();
    }, [fetchSchema]);

    const save = useCallback(async (jsonText: string) => {
        setState((s) => ({ ...s, saving: true, error: null }));
        try {
            const parsed = JSON.parse(jsonText);
            await axios.put(API, parsed);
            setState((s) => ({
                ...s,
                schema: parsed,
                schemaText: jsonText,
                isFactory: false,
                saving: false,
            }));
            return { success: true };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to save schema';
            setState((s) => ({ ...s, saving: false, error: msg }));
            return { success: false, error: msg };
        }
    }, []);

    const reset = useCallback(async () => {
        setState((s) => ({ ...s, saving: true, error: null }));
        try {
            const { data } = await axios.post(`${API}/reset`);
            const text = JSON.stringify(data.schema, null, 2);
            setState({
                schema: data.schema,
                schemaText: text,
                isFactory: true,
                loading: false,
                saving: false,
                error: null,
            });
            return { success: true };
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to reset schema';
            setState((s) => ({ ...s, saving: false, error: msg }));
            return { success: false, error: msg };
        }
    }, []);

    return {
        ...state,
        fetchSchema,
        save,
        reset,
    };
}
