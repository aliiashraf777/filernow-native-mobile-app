// nativeApp\src\features\khata\components\data-mode-bar.tsx

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BlinkingDot } from "@/components/ui/blinking-dot";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { useKhataStore } from "@/features/khata/store/khata-store";

export function DataModeBar() {
    const { t } = useTranslation(["khata", "common"]);
    const { dataMode } = useBusinessData();
    const loadDemoData = useKhataStore((s) => s.loadDemoData);
    const resetToBlank = useKhataStore((s) => s.resetToBlank);
    const isDemo = dataMode === "demo";
    const [confirmOpen, setConfirmOpen] = useState(false);

    const apply = () => (isDemo ? resetToBlank() : void loadDemoData());

    return (
        <>
            <View className={isDemo ? "mx-4 mt-4 overflow-hidden rounded-brand-12 border border-warning/25 bg-warning-bg" : "mx-4 mt-4 rounded-brand-12 border border-border-clr bg-white"}>
                <View className="flex-row items-center justify-between gap-3 px-3 py-2.5">
                <View className="flex-1 flex-row items-center gap-2">
                    {/* demo: faster, orange blink (this is practice data); live: slow green pulse */}
                    <BlinkingDot className={isDemo ? "bg-warning" : "bg-success"} period={isDemo ? 800 : 1600} />
                    <Text numberOfLines={1} className="flex-1 font-jakarta-medium text-xs text-text-secondary">
                        {t("mode.label", { mode: t(isDemo ? "mode.demo" : "mode.blank") })}
                    </Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => setConfirmOpen(true)}
                    className="min-h-10 shrink-0 justify-center rounded-brand-8 border border-border-clr bg-white px-3 active:bg-page-bg">
                    <Text className="font-jakarta-semibold text-xs text-text-secondary">
                        {t(isDemo ? "mode.startFresh" : "mode.loadDemo")}
                    </Text>
                </Pressable>
                </View>
                {isDemo ? (
                <View className="border-t border-warning/20 px-3 py-2.5">
                    <Text className="font-jakarta text-xs leading-5 text-text-secondary">
                        {t("mode.demoNote")}
                    </Text>
                </View>
                ) : null}
            </View>
            <ConfirmModal
                visible={confirmOpen}
                title={t(isDemo ? "mode.startFreshTitle" : "mode.loadDemoTitle")}
                message={t(isDemo ? "mode.startFreshMessage" : "mode.loadDemoMessage")}
                cancelLabel={t("common:actions.no")}
                confirmLabel={t("common:actions.yes")}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={apply}
                destructive={isDemo}
            />
        </>
    );
}