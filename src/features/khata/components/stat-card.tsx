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

type Props = {
    item: IExpenseStatItem;
    active?: boolean;
    onPress: () => void;
    /** Used as the accessibility label of the pencil ("Add Aamdani"). */
    ctaLabel?: string;
    /** When set, a pencil button appears at the card's top-right. */
    onCtaPress?: () => void;
};

export function StatCard({ item, active, onPress, ctaLabel, onCtaPress }: Props) {
    const chip = CHIP[item.chip];
    const tone = item.isPositive ? colors.success : colors.danger;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            className={cn(
                "min-h-[112px] grow basis-[47%] justify-between gap-2 rounded-brand-12 border bg-white p-3 active:opacity-80",
                active ? "border-primary" : "border-border-clr",
            )}>
            {/* extra right padding keeps the title clear of the pencil */}
            <View className={cn("flex-row items-center gap-2", onCtaPress && "pr-8")}>
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

            {onCtaPress ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={ctaLabel}
                    onPress={onCtaPress}
                    hitSlop={6}
                    className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-page-bg active:opacity-70">
                    <SymbolView name={{ ios: "pencil", android: "edit", web: "edit" }} size={15} tintColor={colors.primary} />
                </Pressable>
            ) : null}
        </Pressable>
    );
}