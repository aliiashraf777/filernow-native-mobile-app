// nativeApp\src\features\khata\components\stats-toggle-bar.tsx

import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

type Props = { open: boolean; onToggle: () => void };

/** Strip like DataModeBar: shows/hides the charts section. */
export function StatsToggleBar({ open, onToggle }: Props) {
    const { t } = useTranslation("khata", { keyPrefix: "stats" });

    return (
        <View className="mx-4 mt-4 flex-row items-center justify-between rounded-brand-12 border border-border-clr bg-white px-3 py-2.5">
            <View className="flex-1 flex-row items-center gap-2">
                <SymbolView name={{ ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" }} size={16} tintColor={colors.primary} />
                <Text numberOfLines={1} className="flex-1 font-jakarta-medium text-xs text-text-secondary">
                    {t("label")}
                </Text>
            </View>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={onToggle}
                className="min-h-10 flex-row items-center gap-1.5 justify-center rounded-brand-8 border border-border-clr px-3 active:bg-page-bg">
                <Text className="font-jakarta-semibold text-xs text-text-secondary">{open ? t("hide") : t("view")}</Text>
                <SymbolView
                    name={open ? { ios: "chevron.up", android: "expand_less", web: "expand_less" } : { ios: "chevron.down", android: "expand_more", web: "expand_more" }}
                    size={14}
                    tintColor={colors["text-secondary"]}
                />
            </Pressable>
        </View>
    );
}