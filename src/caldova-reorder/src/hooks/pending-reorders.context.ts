import { createContext, useContext } from "react";

/**
 * A reorder this browser sent, before the semantic model has caught up.
 *
 * The model reads reorders from OneLake, which Fabric mirrors from the app's
 * database. That mirror takes about half a minute — far too long to leave the
 * screen unchanged after a manager acts. So a sent reorder is held here and
 * painted immediately, then dropped the moment the model reports it.
 */
export interface PendingReorder {
    requestId: string;
    storeId: string;
    sku: string;
    storeName: string;
    productName: string;
    units: number;
    requestedBy: string;
    requestedAt: Date;
}

export interface PendingReordersValue {
    pending: PendingReorder[];
    /** Record a reorder that has just been accepted. */
    add: (reorder: PendingReorder) => void;
    /**
     * Drop any pending reorder the model now reports, matched on request id, so
     * a reorder is never counted twice.
     */
    reconcile: (requestIdsFromModel: readonly string[]) => void;
    /**
     * Units this screen has just put on order for a product, before the model
     * has mirrored them. `undefined` when there is nothing in flight — the
     * model is then the only answer.
     */
    pendingUnits: (storeId: string, sku: string) => number | undefined;
}

export const PendingReordersContext = createContext<PendingReordersValue | undefined>(undefined);

export function usePendingReorders(): PendingReordersValue {
    const context = useContext(PendingReordersContext);

    if (context === undefined) {
        throw new Error("usePendingReorders must be used within a PendingReordersProvider");
    }

    return context;
}
