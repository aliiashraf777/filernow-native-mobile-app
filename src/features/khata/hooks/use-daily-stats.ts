// nativeApp\src\features\khata\hooks\use-daily-stats.ts

import type { SymbolViewProps } from "expo-symbols";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { cashFlow, debtBalances, debtTotals, pkr } from "@/features/khata/lib/debt";
import type { EntryKind, FilterTab, IExpenseEntry, IExpenseStatItem } from "@/features/khata/types/types";

export type StatItem = IExpenseStatItem & { filter: FilterTab; ctaLabel?: string };

const ICONS = {
    balance: { ios: "creditcard.fill", android: "account_balance_wallet", web: "account_balance_wallet" },
    income: { ios: "arrow.up.right", android: "trending_up", web: "trending_up" },
    expense: { ios: "arrow.down.right", android: "trending_down", web: "trending_down" },
    debt: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
} as const satisfies Record<string, SymbolViewProps["name"]>;

type Delta = { percent: number; direction: "up" | "down" };
// nothing to compare against (blank data, or nothing last month): 0%, shown as a neutral chip
const FLAT: Delta = { percent: 0, direction: "up" };

const monthKey = (d: string) => d.slice(0, 7);
// LOCAL month. toISOString() is UTC: on the 1st of a month in Pakistan it would still be last month.
const localMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const shiftMonth = (key: string, offset: number) => {
    const [y, m] = key.split("-").map(Number);
    return localMonthKey(new Date(y, m - 1 + offset, 1));
};

/** This month vs last month as a % + direction. (kind "debt" compares udhaar volume, not net balance.) */
function monthlyDelta(entries: IExpenseEntry[], kind: EntryKind | "net"): Delta {
    if (entries.length === 0) return FLAT;

    const now = localMonthKey(new Date());
    const prev = shiftMonth(now, -1);
    const sum = (k: EntryKind, key: string) =>
        entries.filter((e) => e.kind === k && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);
    const totalFor = (key: string) => (kind === "net" ? sum("income", key) - sum("expense", key) : sum(kind, key));

    const current = totalFor(now);
    const previous = totalFor(prev);
    if (previous === 0) return FLAT;

    return {
        percent: Math.round((Math.abs(current - previous) / Math.abs(previous)) * 100),
        direction: current >= previous ? "up" : "down",
    };
}

export function useDailyStats(): StatItem[] {
    const { t } = useTranslation("khata");
    const { entries, cards } = useBusinessData();

    return useMemo<StatItem[]>(() => {
        const sum = (kind: EntryKind) => entries.filter((e) => e.kind === kind).reduce((s, e) => s + e.amount, 0);
        const { youWillGet, youWillGive } = debtTotals(debtBalances(entries));
        const cardsBalance = cards.reduce((s, c) => s + c.balance, 0);

        // const bal = monthlyDelta(entries, "net");
        // The card shows a BALANCE, so its trend compares the balance now with the balance at the start of
        // this month (= end of last month). That is today's balance minus this month's card cash flow.
        const monthStart = `${localMonthKey(new Date())}-01`;
        const flowThisMonth = entries
            .filter((e) => e.cardId && e.kind !== "debt" && e.date.slice(0, 10) >= monthStart)
            .reduce((s, e) => s + cashFlow(e) * e.amount, 0);
        const startBalance = cardsBalance - flowThisMonth;
        const bal: Delta =
            startBalance === 0
                ? FLAT
                : {
                    percent: Math.round((Math.abs(flowThisMonth) / Math.abs(startBalance)) * 100),
                    direction: flowThisMonth >= 0 ? "up" : "down",
                };

        const inc = monthlyDelta(entries, "income");
        const exp = monthlyDelta(entries, "expense");
        const debt = monthlyDelta(entries, "debt");
        const label = t("trend.vsLastMonth");

        return [
            {
                id: "balance", title: t("daily.stats.balance"), value: pkr(cardsBalance),
                trendDirection: bal.direction, trendPercent: bal.percent, trendLabel: label,
                icon: ICONS.balance, chip: "green", isPositive: bal.direction === "up", filter: "all",
            },
            {
                id: "income", title: t("daily.stats.income"), value: pkr(sum("income")),
                trendDirection: inc.direction, trendPercent: inc.percent, trendLabel: label,
                icon: ICONS.income, chip: "blue", isPositive: inc.direction === "up", filter: "income", ctaLabel: t("daily.add.income"),
            },
            {
                id: "expense", title: t("daily.stats.expense"), value: pkr(sum("expense")),
                trendDirection: exp.direction, trendPercent: exp.percent, trendLabel: label,
                icon: ICONS.expense, chip: "purple", isPositive: exp.direction === "down", filter: "expense", ctaLabel: t("daily.add.expense"),
            },
            {
                id: "debt", title: t("daily.stats.debt"), value: pkr(Math.abs(youWillGet - youWillGive)),
                trendDirection: debt.direction, trendPercent: debt.percent, trendLabel: label,
                icon: ICONS.debt, chip: "red", isPositive: debt.direction === "down", filter: "debt", ctaLabel: t("daily.add.debt"),
            },
        ];
    }, [entries, cards, t]);
}