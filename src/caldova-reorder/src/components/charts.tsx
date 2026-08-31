import { lazy, Suspense, type ReactNode } from "react";

/**
 * Chart entry points.
 *
 * Vega and Vega-Lite are large, and the first thing a manager needs to see is
 * the low-stock list — not a chart. So the chart implementation is split out and
 * loaded after first paint. Until it arrives, each chart reserves its own space
 * so nothing on the screen jumps.
 */

const VegaCharts = lazy(() => import("./vega-charts"));

export interface SeriesPoint {
    /** ISO date, as the model returns it. */
    date: string;
    value: number;
}

interface ChartProps {
    series: SeriesPoint[];
    /** Accessible description; charts carry no tooltips, so this is the fallback. */
    label: string;
}

export interface TrendChartProps extends ChartProps {
    height?: number;
    valueTitle?: string;
}

function Placeholder({ height, children }: { height: number; children?: ReactNode }) {
    return (
        <div style={{ height }} className="flex items-end" aria-hidden>
            {children}
        </div>
    );
}

export function Sparkline({ series, label }: ChartProps) {
    return (
        <Suspense fallback={<Placeholder height={36} />}>
            <VegaCharts kind="sparkline" series={series} label={label} height={36} />
        </Suspense>
    );
}

export function TrendChart({ series, label, height = 168, valueTitle }: TrendChartProps) {
    return (
        <Suspense fallback={<Placeholder height={height} />}>
            <VegaCharts
                kind="trend"
                series={series}
                label={label}
                height={height}
                valueTitle={valueTitle}
            />
        </Suspense>
    );
}
