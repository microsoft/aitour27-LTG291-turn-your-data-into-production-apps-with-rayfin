//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useState } from "react";

import { SummaryTiles } from "@/components/summary-tiles.component";
import { LowStockQueue } from "@/components/low-stock-queue.component";
import { RecentReorders } from "@/components/recent-reorders.component";

/**
 * One screen: what is running low across the manager's stores, and one action
 * per row to do something about it.
 */
function App() {
    const [reloadKey, setReloadKey] = useState(0);

    return (
        <div className="min-h-screen bg-background font-base">
            <div className="mx-auto max-w-[1600px] px-800 pt-700 pb-800">
                <header className="mb-600">
                    <h1 className="text-hero-700 leading-hero-700 font-bold text-foreground">
                        Caldova restock
                    </h1>
                    <p className="mt-100 text-500 leading-500 text-muted-foreground">
                        Your region, from the Caldova operations model.
                    </p>
                </header>

                <SummaryTiles reloadKey={reloadKey} />

                <div className="mt-600 grid grid-cols-[minmax(0,7fr)_minmax(0,3fr)] items-start gap-500">
                    <LowStockQueue onReorderSent={() => setReloadKey((key) => key + 1)} />
                    <RecentReorders reloadKey={reloadKey} />
                </div>
            </div>
        </div>
    );
}

export default App;
