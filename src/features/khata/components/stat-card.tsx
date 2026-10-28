// nativeApp\src\features\khata\components\stat-card.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { IExpenseStatItem, StatChipVariant } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const CHIP: Record<StatChipVariant, { box: string; tint: string }> = {
    green: { box: "bg-chip-green-bg", tint: colors["chip-green"] },
    blue: { box: "bg-chip-blue-bg", tint: colors["chip-blue"] },
    purple: { box: "bg-chip-purple-bg", tint: colors["chip-purple"] },
    red: { box: "bg-chip-red-bg", tint: colors["chip-red"] },
};

type Props = { item: IExpenseStatItem; active?: boolean; onPress: () => void };

export function StatCard({ item, active, onPress }: Props) {
    const chip = CHIP[item.chip];
    const tone = item.isPositive ? colors.success : colors.danger;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            className={cn(
                "min-h-[112px] grow basis-[47%] justify-between rounded-brand-12 border bg-white p-3 active:opacity-80",
                active ? "border-primary" : "border-border-clr",
            )}>
            <View className="flex-row items-center gap-2">
                <View className={cn("h-7 w-7 items-center justify-center rounded-brand-8", chip.box)}>
                    <SymbolView name={item.icon} size={15} tintColor={chip.tint} />
                </View>
                <Text numberOfLines={1} className="flex-1 font-jakarta text-xs text-text-secondary-muted">
                    {item.title}
                </Text>
            </View>

            <Text numberOfLines={1} adjustsFontSizeToFit className="font-jakarta-extrabold text-lg text-text-dark">
                {item.value}
            </Text>

            <View className="flex-row items-center gap-1.5">
                <View className={cn("flex-row items-center gap-0.5 rounded-full px-1.5 py-0.5", item.isPositive ? "bg-success-bg" : "bg-danger-bg")}>
                    <SymbolView
                        name={
                            item.trendDirection === "up"
                                ? { ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" }
                                : { ios: "arrow.down", android: "arrow_downward", web: "arrow_downward" }
                        }
                        size={10}
                        tintColor={tone}
                    />
                    <Text className={cn("font-jakarta-medium text-[11px]", item.isPositive ? "text-success" : "text-danger")}>
                        {item.trendPercent}%
                    </Text>
                </View>
                <Text numberOfLines={1} className="flex-1 font-jakarta text-[11px] text-text-secondary-muter">
                    {item.trendLabel}
                </Text>
            </View>
        </Pressable>
    );
}