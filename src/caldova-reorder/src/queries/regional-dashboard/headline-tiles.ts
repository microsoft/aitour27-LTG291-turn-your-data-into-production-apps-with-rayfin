import query from "./headline-tiles.dax?raw";
import { numberOf, type ModelRow } from "../model-row";

export interface HeadlineTiles {
    storesInRegion: number;
    productsRunningLow: number;
    reordersSentToday: number;
}

/** Column names copied verbatim from the model's query output. */
const columns = {
    storesInRegion: "[StoresInRegion]",
    productsRunningLow: "[ProductsRunningLow]",
    reordersSentToday: "[ReordersSentToday]",
} as const;

export function headlineTiles() {
    return {
        query,
        parse: (row: ModelRow): HeadlineTiles => ({
            storesInRegion: numberOf(row[columns.storesInRegion]),
            productsRunningLow: numberOf(row[columns.productsRunningLow]),
            reordersSentToday: numberOf(row[columns.reordersSentToday]),
        }),
    };
}
