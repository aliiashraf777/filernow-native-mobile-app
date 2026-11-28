// nativeApp\src\features\khata\components\backup-guide-sheet.tsx

import { ArrowRight, Download, RefreshCcw, ShieldCheck, Smartphone } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";

const STEPS = [
    { key: "step1", icon: Download },
    { key: "step2", icon: Smartphone },
    { key: "step3", icon: ShieldCheck },
    { key: "step4", icon: RefreshCcw },
] as const;

/** Plain-language explanation of Backup & Restore. */
export function BackupGuideSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { t } = useTranslation("khata", { keyPrefix: "backup.guide" });

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("title")} subtitle={t("subtitle")}>
            <View className="mb-4 rounded-brand-12 border border-border-clr bg-page-bg p-3">
                <View className="flex-row items-center justify-between">
                    <View className="w-[72px] items-center rounded-brand-12 bg-white py-2">
                        <Smartphone size={20} className="text-text-secondary" strokeWidth={2} />
                        <Text className="mt-1 font-jakarta-semibold text-[10px] text-text-secondary">{t("phone")}</Text>
                    </View>
                    <ArrowRight size={18} className="text-warning" strokeWidth={2} />
                    <View className="w-[72px] items-center rounded-brand-12 border border-warning/20 bg-warning-bg py-2">
                        <ShieldCheck size={20} className="text-warning" strokeWidth={2} />
                        <Text className="mt-1 font-jakarta-semibold text-[10px] text-text-secondary">{t("backupFile")}</Text>
                    </View>
                    <ArrowRight size={18} className="text-warning" strokeWidth={2} />
                    <View className="w-[72px] items-center rounded-brand-12 bg-white py-2">
                        <RefreshCcw size={20} className="text-success" strokeWidth={2} />
                        <Text className="mt-1 font-jakarta-semibold text-[10px] text-text-secondary">{t("restore")}</Text>
                    </View>
                </View>
            </View>

            <Text className="mb-3 font-jakarta text-sm leading-5 text-text-secondary">{t("intro")}</Text>
            {STEPS.map(({ key, icon: Icon }, index) => (
                <View key={key} className="mb-3 flex-row gap-3 rounded-brand-12 border border-border-clr bg-white p-3">
                    <View className="h-9 w-9 items-center justify-center rounded-brand-12 bg-primary-tint">
                        <Icon size={18} className="text-primary" strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <Text className="font-jakarta-bold text-xs text-text-dark">{t(`${key}Title`)}</Text>
                            <Text className="font-jakarta text-[10px] text-text-secondary-muter">{index + 1}/4</Text>
                        </View>
                        <Text className="mt-1 font-jakarta text-xs leading-4 text-text-secondary">{t(key)}</Text>
                    </View>
                </View>
            ))}
            <View className="rounded-brand-12 bg-warning-bg px-3 py-2.5">
                <Text className="font-jakarta-medium text-[11px] leading-4 text-text-secondary">{t("note")}</Text>
            </View>
        </BottomSheet>
    );
}