// nativeApp\src\features\khata\hooks\use-daily-stats.ts

import type { SymbolViewProps } from "expo-symbols";
import { useMemo } from "react";

import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { debtBalances, debtTotals, pkr } from "@/features/khata/lib/debt";
import {
    type EntryKind,
    type FilterTab,
    type IExpenseEntry,
    type IExpenseStatItem,
    KHATA_LABELS,
} from "@/features/khata/types";

export type StatItem = IExpenseStatItem & { filter: FilterTab; ctaLabel?: string; showTrend: boolean };

const ICONS = {
    balance: { ios: "creditcard.fill", android: "account_balance_wallet", web: "account_balance_wallet" },
    income: { ios: "arrow.up.right", android: "trending_up", web: "trending_up" },
    expense: { ios: "arrow.down.right", android: "trending_down", web: "trending_down" },
    debt: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
} as const satisfies Record<string, SymbolViewProps["name"]>;

type Delta = { percent: number; direction: "up" | "down"; hasBaseline: boolean };
// no data last month = nothing to compare against, so the card shows no % chip
const NO_BASELINE: Delta = { percent: 0, direction: "up", hasBaseline: false };

const monthKey = (d: string) => d.slice(0, 7);
// LOCAL month. toISOString() is UTC: on the 1st of a month in Pakistan it would still be last month.
const localMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const shiftMonth = (key: string, offset: number) => {
    const [y, m] = key.split("-").map(Number);
    return localMonthKey(new Date(y, m - 1 + offset, 1));
};

/** This month vs last month, as a % and an up/down direction. (kind "debt" compares udhaar volume, not net balance.) */
function monthlyDelta(entries: IExpenseEntry[], kind: EntryKind | "net"): Delta {
    if (entries.length === 0) return NO_BASELINE;

    const now = localMonthKey(new Date());
    const prev = shiftMonth(now, -1);
    const sum = (k: EntryKind, key: string) =>
        entries.filter((e) => e.kind === k && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);
    const totalFor = (key: string) => (kind === "net" ? sum("income", key) - sum("expense", key) : sum(kind, key));

    const current = totalFor(now);
    const previous = totalFor(prev);
    if (previous === 0) return NO_BASELINE;

    return {
        percent: Math.round((Math.abs(current - previous) / Math.abs(previous)) * 100),
        direction: current >= previous ? "up" : "down",
        hasBaseline: true,
    };
}

export function useDailyStats(): StatItem[] {
    const { entries, cards } = useBusinessData();

    return useMemo(() => {
        const sum = (kind: EntryKind) => entries.filter((e) => e.kind === kind).reduce((s, e) => s + e.amount, 0);
        const { youWillGet, youWillGive } = debtTotals(debtBalances(entries));
        const cardsBalance = cards.reduce((s, c) => s + c.balance, 0);

        const bal = monthlyDelta(entries, "net");
        const inc = monthlyDelta(entries, "income");
        const exp = monthlyDelta(entries, "expense");
        const debt = monthlyDelta(entries, "debt");
        const label = (d: Delta) => (d.hasBaseline ? "vs last month" : "No data last month");

        return [
            {
                id: "balance", title: "Total Cards Balance", value: pkr(cardsBalance),
                trendDirection: bal.direction, trendPercent: bal.percent, trendLabel: label(bal), showTrend: bal.hasBaseline,
                icon: ICONS.balance, chip: "green", isPositive: bal.direction === "up", filter: "all",
            },
            {
                id: "income", title: KHATA_LABELS.income.title, value: pkr(sum("income")),
                trendDirection: inc.direction, trendPercent: inc.percent, trendLabel: label(inc), showTrend: inc.hasBaseline,
                icon: ICONS.income, chip: "blue", isPositive: inc.direction === "up", filter: "income", ctaLabel: KHATA_LABELS.income.verb,
            },
            {
                id: "expense", title: KHATA_LABELS.expense.title, value: pkr(sum("expense")),
                trendDirection: exp.direction, trendPercent: exp.percent, trendLabel: label(exp), showTrend: exp.hasBaseline,
                icon: ICONS.expense, chip: "purple", isPositive: exp.direction === "down", filter: "expense", ctaLabel: KHATA_LABELS.expense.verb,
            },
            {
                id: "debt", title: KHATA_LABELS.debt.title, value: pkr(Math.abs(youWillGet - youWillGive)),
                trendDirection: debt.direction, trendPercent: debt.percent, trendLabel: label(debt), showTrend: debt.hasBaseline,
                icon: ICONS.debt, chip: "red", isPositive: debt.direction === "down", filter: "debt", ctaLabel: KHATA_LABELS.debt.verb,
            },
        ];
    }, [entries, cards]);
}