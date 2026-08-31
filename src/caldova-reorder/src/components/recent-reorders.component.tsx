import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useModelQuery } from "@/hooks/use-model-query";
import { useReloadOn } from "@/hooks/use-reload-on";
import { recentReorders, type Reorder } from "@/queries/regional-dashboard";

interface RecentReordersProps {
    /** Bumped after a reorder lands, so the list re-reads the model. */
    reloadKey: number;
}

export function RecentReorders({ reloadKey }: RecentReordersProps) {
    const { rows, isLoading, error, refresh } = useModelQuery(recentReorders());
    const arrived = useArrivals(rows);

    useReloadOn(reloadKey, refresh);

    return (
        <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-600 py-500">
                <h2 className="text-600 leading-600 font-semibold text-foreground">Recent reorders</h2>
                <p className="mt-100 text-400 leading-400 text-muted-foreground">
                    Recorded in Fabric, with who asked and when.
                </p>
            </header>

            {error ? (
                <p role="alert" className="px-600 py-700 text-400 leading-400 text-destructive">
                    Could not read recent reorders. {error}
                </p>
            ) : isLoading ? (
                <p className="px-600 py-700 text-400 leading-400 text-muted-foreground">Reading the model…</p>
            ) : rows.length === 0 ? (
                <p className="px-600 py-700 text-500 leading-500 text-muted-foreground">
                    No reorders sent yet.
                </p>
            ) : (
                <ul>
                    <AnimatePresence initial={false}>
                        {rows.map((reorder) => (
                            <ReorderRow
                                key={reorder.requestId}
                                reorder={reorder}
                                isNew={arrived.has(reorder.requestId)}
                            />
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </section>
    );
}

interface ReorderRowProps {
    reorder: Reorder;
    isNew: boolean;
}

function ReorderRow({ reorder, isNew }: ReorderRowProps) {
    return (
        <motion.li
            layout
            initial={isNew ? { opacity: 0, height: 0 } : false}
            animate={{
                opacity: 1,
                height: "auto",
                // A single, deliberate flash: unmistakable from the back of the
                // room, and over inside a second.
                backgroundColor: isNew
                    ? ["var(--color-success)", "var(--color-card)"]
                    : "var(--color-card)",
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="border-b border-border px-600 py-400 last:border-b-0"
        >
            <div className="flex items-baseline justify-between gap-400">
                <p className="min-w-0 flex-1 truncate text-500 leading-500 font-semibold text-foreground">
                    {reorder.productName}
                </p>
                <p className="font-numeric text-500 leading-500 font-bold tabular-nums text-foreground">
                    {reorder.units}
                    <span className="ml-100 text-400 font-medium text-muted-foreground">units</span>
                </p>
            </div>
            <p className="mt-100 text-400 leading-400 text-muted-foreground">
                {reorder.storeName} · {reorder.requestedBy} · {formatWhen(reorder.requestedAt)}
            </p>
        </motion.li>
    );
}

/** Tracks which request ids appeared after the first load, so only they flash. */
function useArrivals(rows: Reorder[]): Set<string> {
    const seen = useRef<Set<string> | null>(null);
    const [arrived, setArrived] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (rows.length === 0) return;

        const ids = rows.map((row) => row.requestId);

        if (seen.current === null) {
            seen.current = new Set(ids);
            return;
        }

        const fresh = ids.filter((id) => !seen.current!.has(id));
        if (fresh.length === 0) return;

        fresh.forEach((id) => seen.current!.add(id));
        setArrived(new Set(fresh));
    }, [rows]);

    return arrived;
}

function formatWhen(at: Date): string {
    if (Number.isNaN(at.getTime())) return "just now";

    return at.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
