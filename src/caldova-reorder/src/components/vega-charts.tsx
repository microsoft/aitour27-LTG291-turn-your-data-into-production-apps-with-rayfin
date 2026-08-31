import { useMemo } from "react";
import { VegaVisual, useCssTheme } from "@microsoft/fabric-visuals";
import type { VisualizationSpec } from "@microsoft/fabric-visuals";

import type { SeriesPoint } from "./charts";

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
    kind: "sparkline" | "trend";
    series: SeriesPoint[];
    label: string;
    height: number;
    valueTitle?: string;
}

export default function VegaCharts({ kind, series, label, height, valueTitle }: VegaChartsProps) {
    const theme = useCssTheme();

    const spec = useMemo<VisualizationSpec>(
        () => (kind === "sparkline" ? sparklineSpec(series, height) : trendSpec(series, height, valueTitle)),
        [kind, series, height, valueTitle],
    );

    if (series.length === 0) {
        return <div style={{ height }} aria-hidden />;
    }

    return (
        <div role="img" aria-label={label} style={{ height }}>
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

function sparklineSpec(series: SeriesPoint[], height: number): VisualizationSpec {
    return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: values(series) },
        width: "container",
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

function trendSpec(series: SeriesPoint[], height: number, valueTitle?: string): VisualizationSpec {
    return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: { values: values(series) },
        width: "container",
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
