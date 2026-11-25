// nativeApp\src\features\khata\hooks\use-udhaar-stats.ts

import type { SymbolViewProps } from "expo-symbols";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { debtBalances, debtTotals, pkr } from "@/features/khata/lib/debt";
import type { IExpenseEntry, IExpenseStatItem } from "@/features/khata/types/types";

const ICONS = {
    net: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
    get: { ios: "arrow.down.left", android: "south_west", web: "south_west" },
    give: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
    settled: { ios: "checkmark.circle", android: "check_circle", web: "check_circle" },
} as const satisfies Record<string, SymbolViewProps["name"]>;

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

type Snapshot = { get: number; give: number; net: number; settled: number };

/**
 * Receivables/payables counting only entries dated on or before `cutoff` ("YYYY-MM-DD"; none = everything).
 * Example: cutoff = last day of last month gives the books as they stood a month ago.
 */
function snapshot(entries: IExpenseEntry[], cutoff?: string): Snapshot {
    const upTo = cutoff ? entries.filter((e) => e.date.slice(0, 10) <= cutoff) : entries;
    const balances = debtBalances(upTo);
    const { youWillGet, youWillGive } = debtTotals(balances);
    return {
        get: youWillGet,
        give: youWillGive,
        net: youWillGet - youWillGive,
        settled: [...balances.values()].filter((v) => v === 0).length,
    };
}

/** Change as % + direction. Previous 0 = nothing to compare against, so 0% (shown as a neutral chip). */
function change(current: number, previous: number): { percent: number; direction: "up" | "down" } {
    if (previous === 0) return { percent: 0, direction: "up" };
    return {
        percent: Math.round((Math.abs(current - previous) / Math.abs(previous)) * 100),
        direction: current >= previous ? "up" : "down",
    };
}

/** Four Udhaar stat cards (same shape as Daily's, so StatCard is reused as-is). */
export function useUdhaarStats(): IExpenseStatItem[] {
    const { t } = useTranslation("khata");
    const { entries } = useBusinessData();

    return useMemo<IExpenseStatItem[]>(() => {
        const now = new Date();
        const lastMonthEnd = ymd(new Date(now.getFullYear(), now.getMonth(), 0)); // day 0 = last day of previous month
        const cur = snapshot(entries);
        const prev = snapshot(entries, lastMonthEnd);

        const net = change(cur.net, prev.net);
        const get = change(cur.get, prev.get);
        const give = change(cur.give, prev.give);
        const settled = change(cur.settled, prev.settled);
        const label = t("trend.vsLastMonth");

        return [
            {
                // signed: a minus means you owe more than you are owed
                id: "net", title: t("udhaar.stats.net"), value: `${cur.net < 0 ? "-" : ""}${pkr(Math.abs(cur.net))}`,
                trendDirection: net.direction, trendPercent: net.percent, trendLabel: label,
                icon: ICONS.net, chip: "purple", isPositive: net.direction === "up",
            },
            {
                id: "get", title: t("udhaar.stats.get"), value: pkr(cur.get),
                trendDirection: get.direction, trendPercent: get.percent, trendLabel: label,
                icon: ICONS.get, chip: "red", isPositive: get.direction === "up",
            },
            {
                // owing more is bad news, so "down" is the good direction here
                id: "give", title: t("udhaar.stats.give"), value: pkr(cur.give),
                trendDirection: give.direction, trendPercent: give.percent, trendLabel: label,
                icon: ICONS.give, chip: "green", isPositive: give.direction === "down",
            },
            {
                id: "settled", title: t("udhaar.stats.settled"), value: String(cur.settled),
                trendDirection: settled.direction, trendPercent: settled.percent, trendLabel: label,
                icon: ICONS.settled, chip: "blue", isPositive: settled.direction === "up",
            },
        ];
    }, [entries, t]);
}