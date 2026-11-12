// nativeApp\src\features\khata\components\udhaar-activity-chart.tsx

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { buildDebtActivity, type Grain } from "@/features/khata/lib/debt-activity";
import type { IExpenseEntry } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const GRAIN_KEYS: Grain[] = ["day", "week", "month"];
const SERIES = [colors.danger, colors.success]; // gave, got

// axis labels: 1500 -> 1.5K
const compact = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(Math.round(n)));

/** Gave vs Got per day/week/month. */
export function UdhaarActivityChart({ entries }: { entries: IExpenseEntry[] }) {
    const { t } = useTranslation("khata", { keyPrefix: "udhaar.activity" });
    const [grain, setGrain] = useState<Grain>("week");

    const data = useMemo(() => buildDebtActivity(entries, grain), [entries, grain]);
    const groups = useMemo(() => data.map((d) => ({ label: d.label, values: [d.gave, d.got] })), [data]);
    const hasData = data.some((d) => d.gave > 0 || d.got > 0);

    return (
        <View className="mx-4 mt-4 rounded-brand-12 border border-border-clr bg-white p-3">
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                    <Text className="font-jakarta-semibold text-sm text-text-dark">{t("title")}</Text>
                    <Text className="font-jakarta text-xs text-text-secondary-muter">{t("subtitle")}</Text>
                </View>
                <View className="flex-row gap-1.5">
                    {GRAIN_KEYS.map((g) => (
                        <Pressable
                            key={g}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: grain === g }}
                            onPress={() => setGrain(g)}
                            className={cn(
                                "min-h-8 justify-center rounded-full border px-3",
                                grain === g ? "border-primary bg-primary" : "border-border-clr bg-white",
                            )}>
                            <Text className={cn("font-jakarta-semibold text-[11px]", grain === g ? "text-white" : "text-text-secondary")}>
                                {t(`grain.${g}`)}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {hasData ? (
                <>
                    <View className="mt-3">
                        <GroupedBarChart groups={groups} seriesColors={SERIES} formatValue={compact} />
                    </View>
                    <View className="mt-3 flex-row justify-center gap-4">
                        <View className="flex-row items-center gap-1.5">
                            <View className="h-2 w-2 rounded-full bg-danger" />
                            <Text className="font-jakarta-medium text-xs text-text-secondary-muted">{t("gave")}</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <View className="h-2 w-2 rounded-full bg-success" />
                            <Text className="font-jakarta-medium text-xs text-text-secondary-muted">{t("got")}</Text>
                        </View>
                    </View>
                </>
            ) : (
                <Text className="py-10 text-center font-jakarta text-xs text-text-secondary-muted">{t("empty")}</Text>
            )}
        </View>
    );
}