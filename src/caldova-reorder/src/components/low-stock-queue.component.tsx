import { useState } from "react";

import { getRayfinClient } from "@/lib/rayfin-client";
import { cn } from "@/lib/utils";
import { useModelQuery } from "@/hooks/use-model-query";
import { lowStockQueue, lowStockKey, type LowStockItem } from "@/queries/regional-dashboard";

interface LowStockQueueProps {
    /** Called after a reorder lands, so the rest of the screen re-reads the model. */
    onReorderSent: () => void;
}

export function LowStockQueue({ onReorderSent }: LowStockQueueProps) {
    const { rows, isLoading, error, refresh } = useModelQuery(lowStockQueue());

    return (
        <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-600 py-500">
                <h2 className="text-600 leading-600 font-semibold text-foreground">Products running low</h2>
                <p className="mt-100 text-400 leading-400 text-muted-foreground">
                    Worst first. &ldquo;Running low&rdquo; is defined in the semantic model.
                </p>
            </header>

            {error ? (
                <p role="alert" className="px-600 py-700 text-400 leading-400 text-destructive">
                    Could not read the low-stock queue. {error}
                </p>
            ) : isLoading ? (
                <LoadingRows />
            ) : rows.length === 0 ? (
                <p className="px-600 py-700 text-500 leading-500 text-muted-foreground">
                    Nothing is running low across your stores right now.
                </p>
            ) : (
                <ul>
                    {rows.map((item) => (
                        <LowStockRow
                            key={lowStockKey(item)}
                            item={item}
                            onSent={() => {
                                refresh();
                                onReorderSent();
                            }}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

type RowState = "idle" | "sending" | "sent" | "failed";

interface LowStockRowProps {
    item: LowStockItem;
    onSent: () => void;
}

function LowStockRow({ item, onSent }: LowStockRowProps) {
    const [units, setUnits] = useState(item.suggestedReorderUnits);
    const [state, setState] = useState<RowState>("idle");
    const [failure, setFailure] = useState<string | null>(null);

    async function sendReorder() {
        setState("sending");
        setFailure(null);

        try {
            await getRayfinClient().functions.sendReorder.invoke({
                storeId: item.storeId,
                sku: item.sku,
                units,
            });
            setState("sent");
            onSent();
        } catch (err) {
            setState("failed");
            setFailure(err instanceof Error ? err.message : String(err));
        }
    }

    return (
        <li className="flex items-center gap-500 border-b border-border px-600 py-400 last:border-b-0">
            <div className="min-w-0 flex-1">
                <p className="truncate text-500 leading-500 font-semibold text-foreground">{item.productName}</p>
                <p className="text-400 leading-400 text-muted-foreground">{item.storeName}</p>
            </div>

            <DaysOfStock item={item} />

            <div className="w-[10ch] text-right">
                <p className="font-numeric text-500 leading-500 font-semibold tabular-nums text-foreground">
                    {item.onHandUnits}
                </p>
                <p className="text-400 leading-400 text-muted-foreground">on hand</p>
            </div>

            {state === "sent" ? (
                <p className="w-[22ch] text-right text-400 leading-400 font-semibold text-success">
                    Reorder sent — {units} units
                </p>
            ) : (
                <div className="flex w-[22ch] items-center justify-end gap-300">
                    <label className="sr-only" htmlFor={`units-${lowStockKey(item)}`}>
                        Units to reorder for {item.productName} at {item.storeName}
                    </label>
                    <input
                        id={`units-${lowStockKey(item)}`}
                        type="number"
                        min={1}
                        value={units}
                        onChange={(event) => setUnits(Number(event.target.value))}
                        disabled={state === "sending"}
                        className="w-[8ch] rounded-md border border-input bg-background px-300 py-200 text-right font-numeric text-400 leading-400 tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={sendReorder}
                        disabled={state === "sending"}
                        className="rounded-md bg-primary px-400 py-200 text-400 leading-400 font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    >
                        {state === "sending" ? "Sending…" : "Reorder"}
                    </button>
                </div>
            )}

            {failure && (
                <p role="alert" className="sr-only">
                    {failure}
                </p>
            )}
        </li>
    );
}

/**
 * The hero value on each row.
 *
 * Urgency is carried by the word, the weight and the bar as well as the colour,
 * so it survives a washed-out projector and colour-blind viewers.
 */
function DaysOfStock({ item }: { item: LowStockItem }) {
    const isCritical = item.stockStatus === "Critical";
    const fill = Math.min(100, Math.max(6, (item.daysOfStock / 7) * 100));

    return (
        <div className="w-[15ch]">
            <div className="flex items-baseline gap-200">
                <span
                    className={cn(
                        "font-numeric text-hero-800 leading-hero-800 tabular-nums",
                        isCritical ? "font-bold text-destructive" : "font-semibold text-foreground",
                    )}
                >
                    {item.daysOfStock.toFixed(1)}
                </span>
                <span className="text-400 leading-400 text-muted-foreground">days left</span>
            </div>

            <div className="mt-200 h-[10px] w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn("h-full rounded-full", isCritical ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${fill}%` }}
                />
            </div>

            <span
                className={cn(
                    "mt-200 inline-block rounded-full px-300 py-100 text-300 leading-300 font-bold uppercase tracking-wide",
                    isCritical
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground",
                )}
            >
                {item.stockStatus}
            </span>
        </div>
    );
}

function LoadingRows() {
    return (
        <ul aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex items-center gap-500 border-b border-border px-600 py-500 last:border-b-0">
                    <div className="h-[24px] flex-1 animate-pulse rounded-md bg-muted" />
                    <div className="h-[24px] w-[12ch] animate-pulse rounded-md bg-muted" />
                    <div className="h-[24px] w-[18ch] animate-pulse rounded-md bg-muted" />
                </li>
            ))}
        </ul>
    );
}
