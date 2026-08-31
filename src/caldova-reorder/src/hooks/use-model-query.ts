import { useCallback, useEffect, useState } from "react";

import { getRayfinClient } from "@/lib/rayfin-client";
import type { ModelRow } from "@/queries/model-row";

interface ModelQuery<T> {
    query: string;
    parse: (row: ModelRow) => T;
}

export interface ModelQueryState<T> {
    rows: T[];
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Runs a DAX query against Caldova's semantic model through the Rayfin
 * connector.
 *
 * The connector runs with delegated auth, so the model applies its own
 * row-level security to the signed-in manager. Nothing here filters by region.
 */
export function useModelQuery<T>(source: ModelQuery<T>): ModelQueryState<T> {
    const { query, parse } = source;

    const [rows, setRows] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setIsLoading(true);

            try {
                const result = await getRayfinClient().connectors.caldovaModel.executeQuery({
                    query,
                });
                if (cancelled) return;

                if (result.status === "error") {
                    setError(result.error.message);
                    setRows([]);
                    return;
                }

                const { columns, rows: values } = result.table;
                setRows(
                    values.map((value) =>
                        parse(Object.fromEntries(columns.map((column, i) => [column.name, value[i]]))),
                    ),
                );
                setError(null);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : String(err));
                    setRows([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // `parse` is a stable pure mapper recreated by each query factory call.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, reloadToken]);

    return { rows, isLoading, error, refresh };
}
