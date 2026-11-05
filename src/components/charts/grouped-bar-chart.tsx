// nativeApp\src\components\charts\grouped-bar-chart.tsx

import { useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

import { colors } from "@/theme/tokens";

export type BarGroup = { label: string; values: number[] };
type Props = {
    groups: BarGroup[];
    /** One color per series, same order as `values`. */
    seriesColors: string[];
    height?: number;
    formatValue?: (n: number) => string;
};

const PAD = { top: 10, right: 6, bottom: 24, left: 40 };
const TICKS = 4;
const FONT = "PlusJakartaSans_500Medium";

/** Rounds up to 1, 2, 5 or 10 times a power of ten so the axis ends on a clean number. */
function niceCeil(n: number) {
    const pow = 10 ** Math.floor(Math.log10(n));
    const f = n / pow;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

export function GroupedBarChart({ groups, seriesColors, height = 200, formatValue = String }: Props) {
    const [width, setWidth] = useState(0);

    const max = niceCeil(Math.max(1, ...groups.flatMap((g) => g.values)));
    const innerW = Math.max(0, width - PAD.left - PAD.right);
    const innerH = height - PAD.top - PAD.bottom;
    const groupW = groups.length ? innerW / groups.length : 0;
    const n = Math.max(1, seriesColors.length);
    const barW = Math.min(22, (groupW * 0.72) / n);
    const gap = 3;
    const yOf = (v: number) => PAD.top + innerH - (v / max) * innerH;

    return (
        <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
            {width > 0 ? (
                <Svg width={width} height={height}>
                    {Array.from({ length: TICKS + 1 }, (_, i) => {
                        const v = (max * i) / TICKS;
                        return (
                            <G key={i}>
                                <Line
                                    x1={PAD.left}
                                    x2={width - PAD.right}
                                    y1={yOf(v)}
                                    y2={yOf(v)}
                                    stroke={colors["border-clr"]}
                                    strokeDasharray="3 3"
                                    strokeWidth={1}
                                />
                                <SvgText x={PAD.left - 6} y={yOf(v) + 3} fontSize={10} fill={colors["text-secondary-muter"]} textAnchor="end" fontFamily={FONT}>
                                    {formatValue(v)}
                                </SvgText>
                            </G>
                        );
                    })}

                    {groups.map((g, gi) => {
                        const cx = PAD.left + groupW * gi + groupW / 2;
                        const total = barW * n + gap * (n - 1);
                        return (
                            <G key={`${g.label}-${gi}`}>
                                {g.values.map((v, si) =>
                                    v > 0 ? (
                                        <Rect
                                            key={si}
                                            x={cx - total / 2 + si * (barW + gap)}
                                            y={yOf(v)}
                                            width={barW}
                                            height={(v / max) * innerH}
                                            rx={3}
                                            fill={seriesColors[si]}
                                        />
                                    ) : null,
                                )}
                                <SvgText x={cx} y={height - 8} fontSize={10} fill={colors["text-secondary-muter"]} textAnchor="middle" fontFamily={FONT}>
                                    {g.label}
                                </SvgText>
                            </G>
                        );
                    })}
                </Svg>
            ) : null}
        </View>
    );
}