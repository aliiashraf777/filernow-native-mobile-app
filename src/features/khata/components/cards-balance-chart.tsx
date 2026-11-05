// nativeApp\src\features\khata\components\cards-balance-chart.tsx

import { Text, View } from "react-native";

import { DonutChart, PALETTE } from "@/components/charts/donut-chart";
import { ChartCard, ChartEmpty } from "@/features/khata/components/chart-card";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { pkr } from "@/features/khata/lib/debt";
import { formatAmount } from "@/features/khata/lib/trend";

export function CardsBalanceChart() {
    const { cards } = useBusinessData();
    const total = cards.reduce((s, c) => s + c.balance, 0);
    const positive = cards.reduce((s, c) => s + Math.max(0, c.balance), 0);

    if (cards.length === 0) {
        return (
            <ChartCard title="Balance Distribution" subtitle="Across all linked cards">
                <ChartEmpty title="No cards yet" text="Add a card to see balance distribution." />
            </ChartCard>
        );
    }

    return (
        <ChartCard title="Balance Distribution" subtitle="Across all linked cards">
            <DonutChart slices={cards.map((c, i) => ({ value: Math.max(0, c.balance), color: PALETTE[i % PALETTE.length] }))}>
                <Text className="font-jakarta text-[11px] text-text-secondary-muter">Total</Text>
                <Text className="font-jakarta-bold text-base text-text-dark">Rs {formatAmount(total)}</Text>
            </DonutChart>
            <View className="mt-3 gap-1.5">
                {cards.map((c, i) => (
                    <View key={c.id} className="flex-row items-center gap-2">
                        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                        <Text numberOfLines={1} className="flex-1 font-jakarta text-xs text-text-secondary">
                            {c.label}
                        </Text>
                        <Text className="font-jakarta-semibold text-xs text-text-dark">
                            {pkr(c.balance)} ({positive > 0 ? Math.round((Math.max(0, c.balance) / positive) * 100) : 0}%)
                        </Text>
                    </View>
                ))}
            </View>
        </ChartCard>
    );
}