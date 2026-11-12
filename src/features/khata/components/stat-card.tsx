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

/** none = no add action, pencil = icon at the top-right, button = full-width "+ Add ..." button. */
export type StatCtaVariant = "none" | "pencil" | "button";

type Props = {
    item: IExpenseStatItem;
    active?: boolean;
    onPress: () => void;
    /** Text of the "button" variant; also the accessibility label of the pencil. */
    ctaLabel?: string;
    onCtaPress?: () => void;
    ctaVariant?: StatCtaVariant;
    /** false = hide the % chip and show only the hint text (for cards with no real month-over-month number). */
    showTrendChip?: boolean;
};

export function StatCard({ item, active, onPress, ctaLabel, onCtaPress, ctaVariant = "none", showTrendChip = true }: Props) {
    const chip = CHIP[item.chip];
    const tone = item.isPositive ? colors.success : colors.danger;
    // an add action only exists when the caller gave us a handler
    const variant: StatCtaVariant = onCtaPress ? ctaVariant : "none";

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            className={cn(
                "min-h-[112px] grow basis-[47%] justify-between gap-2 rounded-brand-12 border bg-white p-3 active:opacity-80",
                active ? "border-primary" : "border-border-clr",
            )}>
            {/* right padding keeps the title clear of the pencil */}
            <View className={cn("flex-row items-center gap-2", variant === "pencil" && "pr-8")}>
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

            {/* trend row */}
            <View className="flex-row items-center gap-1.5">
                {showTrendChip ? (
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
                ) : null}
                <Text numberOfLines={1} className="flex-1 font-jakarta text-[11px] text-text-secondary-muter">
                    {item.trendLabel}
                </Text>
            </View>

            {variant === "button" && ctaLabel ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onCtaPress}
                    className="min-h-9 items-center justify-center rounded-brand-8 bg-page-bg active:opacity-80">
                    <Text className="font-jakarta-semibold text-xs text-primary">+ {ctaLabel}</Text>
                </Pressable>
            ) : null}

            {variant === "pencil" ? (
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