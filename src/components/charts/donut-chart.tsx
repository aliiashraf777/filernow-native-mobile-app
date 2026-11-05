// nativeApp\src\components\charts\donut-chart.tsx

import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

import { colors } from "@/theme/tokens";

export const PALETTE = [colors.primary, "#E06C80", colors.secondary, "#85D0BA", "#B8BDC6"];

type Props = {
    slices: { value: number; color: string }[];
    size?: number;
    thickness?: number;
    /** Rendered in the hole, e.g. a total. */
    children?: ReactNode;
};

export function DonutChart({ slices, size = 180, thickness = 22, children }: Props) {
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    const total = slices.reduce((s, x) => s + x.value, 0);
    const gap = slices.length > 1 ? 3 : 0; // px gap along the circle between slices

    const arcs = slices.reduce<{ color: string; len: number; start: number }[]>((list, s) => {
        const last = list[list.length - 1];
        list.push({ color: s.color, len: total > 0 ? (s.value / total) * c : 0, start: last ? last.start + last.len : 0 });
        return list;
    }, []);

    return (
        <View style={{ width: size, height: size, alignSelf: "center" }}>
            <Svg width={size} height={size}>
                <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
                    <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors["surface-muted"]} strokeWidth={thickness} fill="none" />
                    {arcs.map((a, i) => {
                        const dash = Math.max(0, a.len - gap);
                        return a.len > 0 ? (
                            <Circle
                                key={i}
                                cx={size / 2}
                                cy={size / 2}
                                r={r}
                                stroke={a.color}
                                strokeWidth={thickness}
                                fill="none"
                                strokeDasharray={`${dash} ${c - dash}`}
                                strokeDashoffset={-a.start}
                            />
                        ) : null;
                    })}
                </G>
            </Svg>
            <View style={StyleSheet.absoluteFill} className="items-center justify-center" pointerEvents="none">
                {children}
            </View>
        </View>
    );
}