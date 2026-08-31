import { headlineTiles } from "@/queries/regional-dashboard";
import { useModelQuery } from "@/hooks/use-model-query";
import { useReloadOn } from "@/hooks/use-reload-on";

interface SummaryTilesProps {
    /** Bumped after a reorder lands, so the tiles re-read the model. */
    reloadKey: number;
}

export function SummaryTiles({ reloadKey }: SummaryTilesProps) {
    const { rows, isLoading, error, refresh } = useModelQuery(headlineTiles());
    const tiles = rows[0];

    useReloadOn(reloadKey, refresh);

    if (error) {
        return (
            <div
                role="alert"
                className="rounded-xl border border-destructive bg-card px-600 py-500 text-400 leading-400 text-destructive"
            >
                Could not read the headline numbers from the semantic model. {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-500">
            <Tile label="Stores in region" value={tiles?.storesInRegion} isLoading={isLoading} />
            <Tile label="Products running low" value={tiles?.productsRunningLow} isLoading={isLoading} />
            <Tile label="Reorders sent today" value={tiles?.reordersSentToday} isLoading={isLoading} />
        </div>
    );
}

interface TileProps {
    label: string;
    value: number | undefined;
    isLoading: boolean;
}

function Tile({ label, value, isLoading }: TileProps) {
    return (
        <div className="rounded-xl border border-border bg-card px-600 py-500">
            <div className="font-numeric text-hero-900 leading-hero-900 font-bold tabular-nums text-foreground">
                {isLoading || value === undefined ? (
                    <span className="inline-block h-[52px] w-[5ch] animate-pulse rounded-md bg-muted align-middle" />
                ) : (
                    value.toLocaleString()
                )}
            </div>
            <div className="mt-100 text-500 leading-500 font-medium text-muted-foreground">{label}</div>
        </div>
    );
}
