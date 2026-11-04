// nativeApp\src\features\khata\components\category-breakdown.tsx

import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ChartCard, ChartEmpty } from "@/features/khata/components/chart-card";
import { pkr } from "@/features/khata/lib/debt";
import type { ICategoryBreakdownItem } from "@/features/khata/types";

function CategoryRow({ item, index }: { item: ICategoryBreakdownItem; index: number }) {
    return (
        <View className="flex-row items-center gap-3 border-b border-border-clr py-2.5">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-page-bg">
                <Text className="font-jakarta-semibold text-[11px] text-text-secondary-muter">{index + 1}</Text>
            </View>
            <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-jakarta-semibold text-xs text-text-secondary">
                    {item.category.label}
                </Text>
                <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-page-bg">
                    <View className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, item.percentOfTotal)}%` }} />
                </View>
            </View>
            <View className="items-end">
                <Text className="font-jakarta-semibold text-xs text-text-secondary">{pkr(item.amount)}</Text>
                <Text className="font-jakarta text-[11px] text-text-secondary-muter">{item.percentOfTotal}%</Text>
            </View>
        </View>
    );
}

type Props = { data: ICategoryBreakdownItem[]; total: number };
const PREVIEW = 4;

export function CategoryBreakdown({ data, total }: Props) {
    const [showAll, setShowAll] = useState(false);

    if (data.length === 0) {
        return (
            <ChartCard title="Spending by Category" subtitle="Expense distribution">
                <ChartEmpty title="No expenses yet" text="Your spending breakdown will appear here." />
            </ChartCard>
        );
    }

    const top = data[0];
    return (
        <ChartCard title="Spending by Category" subtitle={`${data.length} categories · Total ${pkr(total)}`}>
            <View className="mb-2 flex-row items-center justify-between rounded-brand-8 bg-page-bg p-2.5">
                <View className="min-w-0 flex-1">
                    <Text className="font-jakarta text-[11px] uppercase tracking-wide text-text-secondary-muter">Highest spending</Text>
                    <Text numberOfLines={1} className="font-jakarta-semibold text-xs text-text-secondary">
                        {top.category.label}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="font-jakarta-bold text-xs text-text-secondary">{pkr(top.amount)}</Text>
                    <Text className="font-jakarta-medium text-[11px] text-primary">{top.percentOfTotal}%</Text>
                </View>
            </View>

            {data.slice(0, PREVIEW).map((item, i) => (
                <CategoryRow key={item.category.id} item={item} index={i} />
            ))}

            {data.length > PREVIEW ? (
                <Pressable accessibilityRole="button" onPress={() => setShowAll(true)} className="mt-1 min-h-10 items-center justify-center">
                    <Text className="font-jakarta-semibold text-xs text-primary">See more ({data.length - PREVIEW} more)</Text>
                </Pressable>
            ) : null}

            <BottomSheet
                visible={showAll}
                onClose={() => setShowAll(false)}
                title="Spending by Category"
                subtitle={`${data.length} categories · ${pkr(total)}`}>
                {data.map((item, i) => (
                    <CategoryRow key={item.category.id} item={item} index={i} />
                ))}
            </BottomSheet>
        </ChartCard>
    );
}