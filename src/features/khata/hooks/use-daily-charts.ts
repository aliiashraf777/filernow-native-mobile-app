// nativeApp\src\hooks\use-daily-charts.ts
// nativeApp\src\features\khata\hooks\use-daily-charts.ts

import { useMemo } from "react";

import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { GRAIN, type Granularity, type TrendRow, buildTrend } from "@/features/khata/lib/trend";
import { useKhataStore } from "@/features/khata/store/khata-store";
import type { ICategoryBreakdownItem } from "@/features/khata/types";

/** Everything the Daily Khata charts need, for the active business. */
export function useDailyCharts() {
    const { entries } = useBusinessData();
    const categories = useKhataStore((s) => s.categories);

    return useMemo(() => {
        const trends = {
            day: buildTrend(entries, GRAIN.day.keyFn, GRAIN.day.limit),
            week: buildTrend(entries, GRAIN.week.keyFn, GRAIN.week.limit),
            month: buildTrend(entries, GRAIN.month.keyFn, GRAIN.month.limit),
        } satisfies Record<Granularity, TrendRow[]>;

        const totals = categories
            .map((category) => ({
                category,
                amount: entries.filter((e) => e.kind === "expense" && e.categoryId === category.id).reduce((s, e) => s + e.amount, 0),
            }))
            .filter((c) => c.amount > 0);
        const total = totals.reduce((s, c) => s + c.amount, 0);
        const breakdown: ICategoryBreakdownItem[] = totals
            .map((c) => ({ ...c, percentOfTotal: total > 0 ? Math.round((c.amount / total) * 100) : 0 }))
            .sort((a, b) => b.amount - a.amount);

        return { trends, breakdown, total };
    }, [entries, categories]);
}