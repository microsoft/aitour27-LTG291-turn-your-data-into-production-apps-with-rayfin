import { useMemo } from "react";
import { VegaVisual, useCssTheme } from "@microsoft/fabric-visuals";
import type { VisualizationSpec } from "@microsoft/fabric-visuals";

import type { FacetSeries, SeriesPoint } from "./charts";

/**
 * The Vega-Lite implementation behind `<Sparkline>` and `<TrendChart>`.
 *
 * House rules, all of them projector rules:
 * - **No tooltips.** Vega-Lite turns them on by default; nobody hovers a
 *   projector, and the demo spec rules them out. Every chart must read cold.
 * - Thick strokes and large tick labels, because thin marks disappear on a
 *   washed-out screen.
 * - Minimal gridlines and no legends where the surrounding copy already says
 *   what the series is.
 */

interface VegaChartsProps {
    kind: "sparkline" | "trend" | "facet";
    series?: SeriesPoint[];
    facets?: FacetSeries[];
    label: string;
    height: number;
    /**
     * Concrete pixel width, measured by the caller. Never `"container"`: Vega
     * would then measure the element itself, and a zero-width measurement — as
     * happens on scroll — collapses the view for good.
     */
    width?: number;
    valueTitle?: string;
    columns?: number;
}

export default function VegaCharts({
    kind,
    series = [],
    facets = [],
    label,
    height,
    width,
    valueTitle,
    columns = 5,
}: VegaChartsProps) {
    const theme = useCssTheme();

    const spec = useMemo<VisualizationSpec>(() => {
        if (kind === "facet") return facetSpec(facets, height, columns);
        return kind === "sparkline"
            ? sparklineSpec(series, height, width)
            : trendSpec(series, height, width, valueTitle);
    }, [kind, series, facets, height, width, valueTitle, columns]);

    const isEmpty = kind === "facet" ? facets.length === 0 : series.length === 0;

    if (isEmpty) {
        return <div style={{ height }} aria-hidden />;
    }

    // A facet grid is as tall as its rows, not as one panel. Pinning it to a
    // single panel's height clips everything below the first row.
    const containerHeight =
        kind === "facet" ? facetGridHeight(facets.length, columns, height) : height;

    return (
        <div role="img" aria-label={label} style={{ height: containerHeight }}>
            <VegaVisual spec={spec} theme={theme} />
        </div>
    );
}

const NAVY = "#1B3658";

function values(series: SeriesPoint[]) {
    return series.map((point) => ({ date: point.date, value: point.value }));
}

/**
 * An area mark anchors itself to zero, which flattens every one of these series
 * into a solid block — daily demand hovers around 2,100, so a zero baseline
 * hides the whole trend. Frame the axis on the data instead, with a little
 * headroom so the line never touches the edges.
 *
 * The trend chart keeps its value labels, so the reader can still see the range
 * they are looking at rather than inferring it from the shape.
 */
function yDomain(series: SeriesPoint[]): [number, number] {
    const points = series.map((point) => point.value);
    const min = Math.min(...points);
    const max = Math.max(...points);
    const spread = max - min || Math.max(1, max * 0.1);

    return [Math.max(0, min - spread * 0.35), max + spread * 0.2];
}

function sparklineSpec(series: SeriesPoint[], height: number, width?: number): VisualizationSpec {
    return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: values(series) },
        width,
        height,
        background: "transparent",
        padding: 0,
        view: { stroke: null },
        // Axes are declared once here so both layers share them. Declaring them
        // per-layer suppresses the merge and the chart comes out bare.
        encoding: {
            x: { field: "date", type: "temporal", axis: null },
            y: {
                field: "value",
                type: "quantitative",
                axis: null,
                scale: { domain: yDomain(series) },
            },
        },
        // No tooltip channel anywhere in this spec — see the note above.
        layer: [
            { mark: { type: "area", line: false, opacity: 0.09, color: NAVY } },
            { mark: { type: "line", strokeWidth: 2.5, color: NAVY, strokeCap: "round" } },
        ],
        config: { axis: { grid: false }, legend: { disable: true } },
    } as VisualizationSpec;
}

function trendSpec(
    series: SeriesPoint[],
    height: number,
    width?: number,
    valueTitle?: string,
): VisualizationSpec {
    return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: values(series) },
        width,
        height,
        background: "transparent",
        view: { stroke: null },
        encoding: {
            x: {
                field: "date",
                type: "temporal",
                title: null,
                axis: {
                    format: "%-d %b",
                    labelFontSize: 14,
                    labelColor: "#475569",
                    tickCount: 4,
                    grid: false,
                    domainColor: "#C3D0E0",
                    tickColor: "#C3D0E0",
                    labelPadding: 6,
                },
            },
            y: {
                field: "value",
                type: "quantitative",
                title: valueTitle ?? null,
                scale: { domain: yDomain(series) },
                axis: {
                    labelFontSize: 14,
                    labelColor: "#475569",
                    titleFontSize: 14,
                    titleColor: "#475569",
                    tickCount: 3,
                    gridColor: "#EDF1F6",
                    domain: false,
                    ticks: false,
                    labelPadding: 6,
                },
            },
        },
        layer: [
            { mark: { type: "area", line: false, opacity: 0.18, color: NAVY } },
            { mark: { type: "line", strokeWidth: 2.5, color: NAVY, strokeCap: "round" } },
        ],
        config: { legend: { disable: true } },
    } as VisualizationSpec;
}

const CRITICAL = "#A11B14";

/** Room for every row of panels, each with its store name above it. */
const FACET_LABEL_HEIGHT = 26;
const FACET_ROW_GAP = 12;

function facetGridHeight(count: number, columns: number, panelHeight: number): number {
    const rows = Math.max(1, Math.ceil(count / columns));
    return rows * (panelHeight + FACET_LABEL_HEIGHT + FACET_ROW_GAP);
}

/**
 * Fifteen stores as small multiples, in one spec.
 *
 * Vega-Lite's `facet` draws every panel from a single dataset, so this is one
 * chart rather than fifteen — noticeably cheaper to mount when the modal opens.
 * Each panel keeps its own y scale (`resolve: independent`): the question a
 * manager is asking is "is this shop draining?", not "which shop holds most",
 * and a shared scale would flatten the small shops into nothing.
 */
function facetSpec(facets: FacetSeries[], height: number, columns: number): VisualizationSpec {
    const values = facets.flatMap((facet) =>
        facet.points.map((point) => ({
            store: facet.storeName,
            date: point.date,
            value: point.value,
            tone: facet.isCritical ? "critical" : "normal",
            weight: facet.isFocused ? 3.5 : 2,
        })),
    );

    return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values },
        background: "transparent",
        columns,
        spacing: { row: FACET_ROW_GAP, column: 16 },
        facet: {
            field: "store",
            type: "nominal",
            title: null,
            header: {
                labelFontSize: 15,
                labelFontWeight: 600,
                labelColor: "#0F1F33",
                labelAnchor: "start",
                labelPadding: 4,
            },
            sort: facets.map((facet) => facet.storeName),
        },
        spec: {
            width: 150,
            height,
            view: { stroke: null },
            encoding: {
                x: { field: "date", type: "temporal", axis: null },
                y: { field: "value", type: "quantitative", axis: null, scale: { zero: true } },
            },
            layer: [
                {
                    mark: { type: "area", line: false, opacity: 0.12 },
                    encoding: {
                        color: {
                            field: "tone",
                            type: "nominal",
                            scale: { domain: ["critical", "normal"], range: [CRITICAL, NAVY] },
                            legend: null,
                        },
                    },
                },
                {
                    mark: { type: "line", strokeCap: "round" },
                    encoding: {
                        color: {
                            field: "tone",
                            type: "nominal",
                            scale: { domain: ["critical", "normal"], range: [CRITICAL, NAVY] },
                            legend: null,
                        },
                        strokeWidth: { field: "weight", type: "quantitative", legend: null },
                    },
                },
            ],
        },
        resolve: { scale: { y: "independent" } },
        config: { legend: { disable: true } },
    } as VisualizationSpec;
}
