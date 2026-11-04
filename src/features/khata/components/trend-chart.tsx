// nativeApp\src\features\khata\components\trend-chart.tsx

// Like the dashboard, one component handles both the bar and pie variants.
import { useState } from "react";
import { Text, View } from "react-native";

import { DonutChart, PALETTE } from "@/components/charts/donut-chart";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { ChipGroup } from "@/components/ui/chip-group";
import { ChartCard, ChartEmpty } from "@/features/khata/components/chart-card";
import { pkr } from "@/features/khata/lib/debt";
import { GRAIN, type Granularity, type TrendRow, formatAmount, formatTick } from "@/features/khata/lib/trend";
import type { EntryKind } from "@/features/khata/types";
import { colors } from "@/theme/tokens";

type KindFilter = "all" | EntryKind;

const KIND_META: Record<EntryKind, { label: string; color: string }> = {
    expense: { label: "Expenses", color: colors.primary },
    income: { label: "Income", color: colors.secondary },
    debt: { label: "Debt", color: colors.warning },
};
const ALL_KINDS: EntryKind[] = ["expense", "income", "debt"];

const GRAIN_OPTIONS = (Object.keys(GRAIN) as Granularity[]).map((g) => ({ value: g, label: GRAIN[g].label }));
const KIND_OPTIONS = [{ value: "all", label: "All" }, ...ALL_KINDS.map((k) => ({ value: k, label: KIND_META[k].label }))];

type Props = {
    title: string;
    dataByGranularity: Record<Granularity, TrendRow[]>;
    variant?: "bar" | "pie";
    defaultGranularity?: Granularity;
};

export function TrendChart({ title, dataByGranularity, variant = "bar", defaultGranularity = "day" }: Props) {
    const [granularity, setGranularity] = useState<Granularity>(defaultGranularity);
    const [kindFilter, setKindFilter] = useState<KindFilter>("all");
    const rows = dataByGranularity[granularity];
    const pie = variant === "pie";

    const controls = (
        <View className="mb-3 gap-2">
            <ChipGroup options={GRAIN_OPTIONS} value={granularity} onChange={(v) => setGranularity(v as Granularity)} />
            {pie ? null : <ChipGroup scroll options={KIND_OPTIONS} value={kindFilter} onChange={(v) => setKindFilter(v as KindFilter)} />}
        </View>
    );

    if (pie) {
        const spent = rows.filter((r) => r.expense > 0);
        const total = spent.reduce((s, r) => s + r.expense, 0);
        return (
            <ChartCard title={title} subtitle="Expense distribution">
                {controls}
                {spent.length === 0 ? (
                    <ChartEmpty title="No expenses yet" text="Your spending will appear here." />
                ) : (
                    <>
                        <DonutChart slices={spent.map((r, i) => ({ value: r.expense, color: PALETTE[i % PALETTE.length] }))}>
                            <Text className="font-jakarta text-[11px] text-text-secondary-muter">Total</Text>
                            <Text className="font-jakarta-bold text-base text-text-dark">Rs {formatAmount(total)}</Text>
                        </DonutChart>
                        <View className="mt-3 gap-1.5">
                            {spent.map((r, i) => (
                                <View key={r.label} className="flex-row items-center gap-2">
                                    <View className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                    <Text numberOfLines={1} className="flex-1 font-jakarta text-xs text-text-secondary-muted">
                                        {formatTick(r.label, granularity)}
                                    </Text>
                                    <Text className="font-jakarta-semibold text-xs text-text-secondary">{pkr(r.expense)}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ChartCard>
        );
    }

    const kinds = kindFilter === "all" ? ALL_KINDS : [kindFilter];
    return (
        <ChartCard title={title} subtitle="Income, expenses & debt">
            {controls}
            {rows.length === 0 ? (
                <ChartEmpty title="No activity yet" text="Your financial activity will appear here." />
            ) : (
                <>
                    <GroupedBarChart
                        groups={rows.map((r) => ({ label: formatTick(r.label, granularity), values: kinds.map((k) => r[k]) }))}
                        seriesColors={kinds.map((k) => KIND_META[k].color)}
                        formatValue={formatAmount}
                    />
                    {kindFilter === "all" ? (
                        <View className="mt-3 flex-row justify-center gap-4 border-t border-border-clr pt-3">
                            {ALL_KINDS.map((k) => (
                                <View key={k} className="flex-row items-center gap-1.5">
                                    <View className="h-2 w-2 rounded-full" style={{ backgroundColor: KIND_META[k].color }} />
                                    <Text className="font-jakarta-medium text-xs text-text-secondary-muted">{KIND_META[k].label}</Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </>
            )}
        </ChartCard>
    );
}