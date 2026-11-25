// nativeApp\src\features\khata\components\stat-card.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { IExpenseStatItem, StatChipVariant } from "@/features/khata/types/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

// Same look as the Party balance tiles: a very light tint, a thin 25%-alpha border (hex 40) and a soft shadow.
const CHIP: Record<StatChipVariant, { fill: string; tint: string; edge: string }> = {
    green: { fill: colors["success-bg"], tint: colors["chip-green"], edge: `${colors["chip-green"]}40` },
    blue: { fill: colors["info-bg"], tint: colors["chip-blue"], edge: `${colors["chip-blue"]}40` },
    purple: { fill: colors["chip-purple-soft"], tint: colors["chip-purple"], edge: `${colors["chip-purple"]}40` },
    red: { fill: colors["danger-bg"], tint: colors["chip-red"], edge: `${colors["chip-red"]}40` },
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
};

export function StatCard({ item, active, onPress, ctaLabel, onCtaPress, ctaVariant = "none" }: Props) {
    const chip = CHIP[item.chip];
    // 0% = no change (or no data to compare): neutral, never green/red
    const flat = item.trendPercent === 0;
    const tone = flat ? colors["text-secondary-muted"] : item.isPositive ? colors.success : colors.danger;
    // an add action only exists when the caller gave us a handler
    const variant: StatCtaVariant = onCtaPress ? ctaVariant : "none";

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: !!active }}
            onPress={onPress}
            style={{
                backgroundColor: chip.fill,
                borderColor: active ? colors.primary : chip.edge,
                borderWidth: active ? 1.5 : 1,
            }}
            className="min-h-[112px] grow basis-[47%] justify-between gap-2 rounded-brand-12 p-3 shadow-sm shadow-black/5 active:scale-[0.98]">
            {/* right padding keeps the title clear of the pencil */}
            <View className={cn("flex-row items-center gap-2", variant === "pencil" && "pr-8")}>
                <View className="h-7 w-7 items-center justify-center rounded-brand-8 bg-white shadow-sm shadow-black/5">
                    <SymbolView name={item.icon} size={15} tintColor={chip.tint} />
                </View>
                <Text numberOfLines={1} className="flex-1 font-jakarta-medium text-xs text-text-secondary">
                    {item.title}
                </Text>
            </View>

            <Text numberOfLines={1} adjustsFontSizeToFit className="font-jakarta-extrabold text-lg text-text-dark">
                {item.value}
            </Text>

            <View className="flex-row items-center gap-1.5">
                <View className="flex-row items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5">
                    <SymbolView
                        name={
                            flat
                                ? { ios: "minus", android: "remove", web: "remove" }
                                : item.trendDirection === "up"
                                    ? { ios: "arrow.up", android: "arrow_upward", web: "arrow_upward" }
                                    : { ios: "arrow.down", android: "arrow_downward", web: "arrow_downward" }
                        }
                        size={10}
                        tintColor={tone}
                    />
                    <Text
                        className={cn(
                            "font-jakarta-semibold text-[11px]",
                            flat ? "text-text-secondary-muted" : item.isPositive ? "text-success" : "text-danger",
                        )}>
                        {item.trendPercent}%
                    </Text>
                </View>
                <Text numberOfLines={1} className="flex-1 font-jakarta text-[11px] text-text-secondary-muted">
                    {item.trendLabel}
                </Text>
            </View>

            {variant === "button" && ctaLabel ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onCtaPress}
                    className="min-h-9 items-center justify-center rounded-brand-8 bg-white active:opacity-80">
                    <Text className="font-jakarta-semibold text-xs text-primary">+ {ctaLabel}</Text>
                </Pressable>
            ) : null}

            {variant === "pencil" ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={ctaLabel}
                    onPress={onCtaPress}
                    hitSlop={6}
                    className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm shadow-black/5 active:opacity-70">
                    <SymbolView name={{ ios: "pencil", android: "edit", web: "edit" }} size={15} tintColor={colors.primary} />
                </Pressable>
            ) : null}
        </Pressable>
    );
}