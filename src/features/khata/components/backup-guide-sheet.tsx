// nativeApp\src\features\khata\components\backup-guide-sheet.tsx

import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";

const STEPS = ["step1", "step2", "step3", "step4"] as const;

/** Plain-language explanation of Backup & Restore. */
export function BackupGuideSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { t } = useTranslation("khata", { keyPrefix: "backup.guide" });

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("title")} subtitle={t("subtitle")}>
            <Text className="mb-4 font-jakarta text-sm leading-5 text-text-secondary">{t("intro")}</Text>
            {STEPS.map((step) => (
                <View key={step} className="mb-3 rounded-brand-12 border border-border-clr bg-white p-3">
                    <Text className="font-jakarta-bold text-xs text-text-dark">{t(`${step}Title`)}</Text>
                    <Text className="mt-1 font-jakarta text-xs leading-4 text-text-secondary">{t(step)}</Text>
                </View>
            ))}
            <Text className="font-jakarta text-[11px] leading-4 text-text-secondary-muted">{t("note")}</Text>
        </BottomSheet>
    );
}