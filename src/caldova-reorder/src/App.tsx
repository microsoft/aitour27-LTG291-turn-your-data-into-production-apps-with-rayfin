//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useEffect, useMemo } from "react";

import { AppHeader } from "@/components/app-header.component";
import { SummaryTiles } from "@/components/summary-tiles.component";
import { LowStockQueue } from "@/components/low-stock-queue.component";
import { RecentReorders } from "@/components/recent-reorders.component";
import { TrendChart } from "@/components/charts";
import { useModelQuery } from "@/hooks/use-model-query";
import { usePendingReorders } from "@/hooks/pending-reorders.context";
import {
    demandTrend,
    headlineTiles,
    lowStockTrend,
    indexOpenReorders,
    lowStockKey,
    indexProductDemand,
    lowStockQueue,
    openReorders,
    productDemand,
    recentReorders,
} from "@/queries/regional-dashboard";

/** How often to re-read the model while a reorder is waiting to be mirrored. */
const RECONCILE_INTERVAL_MS = 15_000;

/**
 * One screen: what is running low across the manager's stores, and one action
 * per row to do something about it.
 */
function App() {
    const { pending, reconcile } = usePendingReorders();
    const pollMs = pending.length > 0 ? RECONCILE_INTERVAL_MS : undefined;

    const tiles = useModelQuery(headlineTiles(), pollMs);
    const queue = useModelQuery(lowStockQueue());
    const reorders = useModelQuery(recentReorders(), pollMs);
    const demand = useModelQuery(demandTrend());
    const perProduct = useModelQuery(productDemand());
    const onOrder = useModelQuery(openReorders(), pollMs);
    const lowTrend = useModelQuery(lowStockTrend());

    const unitsOnOrder = useMemo(() => indexOpenReorders(onOrder.rows), [onOrder.rows]);

    /**
     * A pending reorder is only handed over once the model reports it in *both*
     * places it is painted: the recent list and the on-order badge. Releasing it
     * as soon as the first query catches up would blink the badge off until the
     * second one followed.
     */
    const confirmed = useMemo(
        () => {
            const reported = new Set(reorders.rows.map((reorder) => reorder.requestId));

            return pending
                .filter(
                    (reorder) =>
                        reported.has(reorder.requestId) && unitsOnOrder.has(lowStockKey(reorder)),
                )
                .map((reorder) => reorder.requestId);
        },
        [pending, reorders.rows, unitsOnOrder],
    );

    useEffect(() => {
        reconcile(confirmed);
    }, [confirmed, reconcile]);

    const headline = tiles.rows[0];

    const demandSeries = useMemo(
        () => demand.rows.map((point) => ({ date: point.date, value: point.units })),
        [demand.rows],
    );

    const lowStockSeries = useMemo(
        () => lowTrend.rows.map((point) => ({ date: point.date, value: point.runningLow })),
        [lowTrend.rows],
    );

    const demandByProduct = useMemo(() => indexProductDemand(perProduct.rows), [perProduct.rows]);

    const pendingToday = useMemo(() => {
        const reported = new Set(reorders.rows.map((reorder) => reorder.requestId));
        return pending.filter((reorder) => !reported.has(reorder.requestId)).length;
    }, [pending, reorders.rows]);

    return (
        <div className="min-h-screen bg-background font-base">
            <AppHeader asOf={headline?.latestSalesDate ?? null} region={headline?.region ?? null} />

            <main className="mx-auto max-w-[1680px] px-800 pt-400 pb-600">
                <SummaryTiles
                    tiles={headline}
                    isLoading={tiles.isLoading}
                    error={tiles.error}
                    lowStockTrend={lowStockSeries}
                    pendingToday={pendingToday}
                />

                <div className="mt-500 grid grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-start gap-500">
                    <LowStockQueue
                        items={queue.rows}
                        isLoading={queue.isLoading}
                        error={queue.error}
                        demandByProduct={demandByProduct}
                        unitsOnOrder={unitsOnOrder}
                        onReorderSent={queue.refresh}
                    />

                    <div className="grid gap-500">
                        <RecentReorders
                            reorders={reorders.rows}
                            isLoading={reorders.isLoading}
                            error={reorders.error}
                        />

                        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                            <header className="border-b border-border-strong px-600 py-500">
                                <h2 className="text-600 leading-600 font-semibold text-foreground">
                                    Regional demand
                                </h2>
                                <p className="mt-100 text-400 leading-400 text-muted-foreground">
                                    Units sold per day, last fortnight.
                                </p>
                            </header>
                            <div className="px-500 pt-500 pb-400">
                                <TrendChart
                                    series={demandSeries}
                                    label="Units sold per day across the region over the last fortnight"
                                    height={150}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
