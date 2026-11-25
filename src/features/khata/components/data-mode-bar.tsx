// nativeApp\src\features\khata\components\data-mode-bar.tsx

import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

import { BlinkingDot } from "@/components/ui/blinking-dot";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { useKhataStore } from "@/features/khata/store/khata-store";

export function DataModeBar() {
    const { t } = useTranslation(["khata", "common"]);
    const { dataMode } = useBusinessData();
    const loadDemoData = useKhataStore((s) => s.loadDemoData);
    const resetToBlank = useKhataStore((s) => s.resetToBlank);
    const isDemo = dataMode === "demo";

    const apply = () => (isDemo ? resetToBlank() : void loadDemoData());
    const onPress = () =>
        Alert.alert(t("mode.replaceTitle"), t(isDemo ? "mode.startFreshMessage" : "mode.loadDemoMessage"), [
            { text: t("common:actions.no"), style: "cancel" },
            { text: t("common:actions.yes"), onPress: apply },
        ]);

    return (
        <View className="mx-4 mt-4 flex-row items-center justify-between rounded-brand-12 border border-border-clr bg-white px-3 py-2.5">
            <View className="flex-row items-center gap-2">
                {/* demo: faster, orange blink (this is practice data); live: slow green pulse */}
                <BlinkingDot className={isDemo ? "bg-warning" : "bg-success"} period={isDemo ? 800 : 1600} />
                <Text className="font-jakarta-medium text-xs text-text-secondary">
                    {t("mode.label", { mode: t(isDemo ? "mode.demo" : "mode.blank") })}
                </Text>
            </View>
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                className="min-h-10 justify-center rounded-brand-8 border border-border-clr px-3 active:bg-page-bg">
                <Text className="font-jakarta-semibold text-xs text-text-secondary">
                    {t(isDemo ? "mode.startFresh" : "mode.loadDemo")}
                </Text>
            </Pressable>
        </View>
    );
}