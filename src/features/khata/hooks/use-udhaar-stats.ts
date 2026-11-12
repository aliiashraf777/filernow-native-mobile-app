// nativeApp\src\features\khata\hooks\use-udhaar-stats.ts

import type { SymbolViewProps } from "expo-symbols";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { debtBalances, debtTotals, pkr } from "@/features/khata/lib/debt";
import type { IExpenseStatItem } from "@/features/khata/types";

const ICONS = {
    net: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
    get: { ios: "arrow.down.left", android: "south_west", web: "south_west" },
    give: { ios: "arrow.up.right", android: "north_east", web: "north_east" },
    settled: { ios: "checkmark.circle", android: "check_circle", web: "check_circle" },
} as const satisfies Record<string, SymbolViewProps["name"]>;

/** Four Udhaar stat cards (same shape as Daily's, so StatCard is reused as-is). */
export function useUdhaarStats(): IExpenseStatItem[] {
    const { t } = useTranslation("khata", { keyPrefix: "udhaar.stats" });
    const { entries } = useBusinessData();

    return useMemo(() => {
        const balances = debtBalances(entries);
        const { youWillGet, youWillGive } = debtTotals(balances);
        const settled = [...balances.values()].filter((v) => v === 0).length;
        const net = youWillGet - youWillGive;

        return [
            {
                id: "net", title: t("net"), value: pkr(Math.abs(net)),
                trendDirection: net >= 0 ? "up" : "down", trendPercent: 0,
                trendLabel: net > 0 ? t("netGet") : net < 0 ? t("netGive") : t("netZero"),
                icon: ICONS.net, chip: "red", isPositive: net >= 0,
            },
            {
                id: "get", title: t("get"), value: pkr(youWillGet),
                trendDirection: "up", trendPercent: 0, trendLabel: t("getHint"),
                icon: ICONS.get, chip: "purple", isPositive: true,
            },
            {
                id: "give", title: t("give"), value: pkr(youWillGive),
                trendDirection: "down", trendPercent: 0, trendLabel: t("giveHint"),
                icon: ICONS.give, chip: "blue", isPositive: false,
            },
            {
                id: "settled", title: t("settled"), value: String(settled),
                trendDirection: "up", trendPercent: 0, trendLabel: t("settledHint"),
                icon: ICONS.settled, chip: "green", isPositive: true,
            },
        ];
    }, [entries, t]);
}