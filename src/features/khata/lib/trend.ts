// nativeApp\src\features\khata\lib\trend.ts

import { debtSign } from "@/features/khata/lib/debt";
import type { IExpenseEntry } from "@/features/khata/types";

export type Granularity = "day" | "week" | "month";
export type TrendRow = { label: string; expense: number; income: number; debt: number };
export type DebtTrendRow = { label: string; gave: number; got: number };

export function weekKey(dateStr: string) {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** How each granularity groups dates and how many buckets it shows. */
export const GRAIN: Record<Granularity, { keyFn: (d: string) => string; limit: number; label: string }> = {
    day: { keyFn: (d) => d.slice(0, 10), limit: 7, label: "Daily" },
    week: { keyFn: weekKey, limit: 8, label: "Weekly" },
    month: { keyFn: (d) => d.slice(0, 7), limit: 6, label: "Monthly" },
};

export function buildTrend(
    entries: { date: string; kind: string; amount: number }[],
    keyFn: (d: string) => string,
    limit: number,
): TrendRow[] {
    const map = new Map<string, Omit<TrendRow, "label">>();
    entries.forEach((e) => {
        const key = keyFn(e.date);
        const bucket = map.get(key) ?? { expense: 0, income: 0, debt: 0 };
        if (e.kind === "expense" || e.kind === "income" || e.kind === "debt") bucket[e.kind] += e.amount;
        map.set(key, bucket);
    });
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-limit)
        .map(([label, v]) => ({ label, ...v }));
}

export function buildDebtTrend(entries: IExpenseEntry[], keyFn: (d: string) => string, limit: number): DebtTrendRow[] {
    const map = new Map<string, { gave: number; got: number }>();
    entries.forEach((e) => {
        const sign = debtSign(e);
        if (!sign) return;
        const key = keyFn(e.date);
        const bucket = map.get(key) ?? { gave: 0, got: 0 };
        if (sign > 0) bucket.gave += e.amount;
        else bucket.got += e.amount;
        map.set(key, bucket);
    });
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-limit)
        .map(([label, v]) => ({ label, ...v }));
}

/** Axis label for a bucket key. */
export function formatTick(label: string, g: Granularity) {
    if (g === "month") {
        const [y, m] = label.split("-");
        return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", { month: "short" });
    }
    if (g === "week") return label.slice(5); // "2026-W43" -> "W43"
    return new Date(`${label}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function formatAmount(v: number) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
}