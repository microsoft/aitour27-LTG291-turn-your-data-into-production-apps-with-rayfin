import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
    PendingReordersContext,
    type PendingReorder,
    type PendingReordersValue,
} from "./pending-reorders.context";

/**
 * Holds reorders sent this session until the semantic model reports them.
 *
 * This is what makes the screen move the instant a manager acts, without
 * inventing numbers: a pending reorder is a request the app knows succeeded and
 * the model has simply not mirrored yet.
 */
export function PendingReordersProvider({ children }: { children: ReactNode }) {
    const [pending, setPending] = useState<PendingReorder[]>([]);

    const add = useCallback((reorder: PendingReorder) => {
        setPending((current) => [reorder, ...current]);
    }, []);

    const reconcile = useCallback((requestIdsFromModel: readonly string[]) => {
        if (requestIdsFromModel.length === 0) return;

        const reported = new Set(requestIdsFromModel);

        setPending((current) => {
            const remaining = current.filter((reorder) => !reported.has(reorder.requestId));
            return remaining.length === current.length ? current : remaining;
        });
    }, []);

    const value = useMemo<PendingReordersValue>(
        () => ({
            pending,
            add,
            reconcile,
            pendingUnits: (storeId, sku) => {
                const matches = pending.filter(
                    (reorder) => reorder.storeId === storeId && reorder.sku === sku,
                );

                if (matches.length === 0) return undefined;

                return matches.reduce((total, reorder) => total + reorder.units, 0);
            },
        }),
        [pending, add, reconcile],
    );

    return (
        <PendingReordersContext.Provider value={value}>{children}</PendingReordersContext.Provider>
    );
}
