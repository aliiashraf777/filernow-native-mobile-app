// nativeApp\src\features\khata\components\local-only-note.tsx

import * as DocumentPicker from "expo-document-picker";
import { ChevronRight, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { suspendLockWhile } from "@/features/app-lock/lib/lock-suspension";
import { useBusinessStore } from "@/features/business/store/business-store";
import { BackupGuideSheet } from "@/features/khata/components/backup-guide-sheet";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { MIME, deliverFile } from "@/features/khata/lib/export-file";
import { buildBackup, parseBackup } from "@/features/khata/lib/khata-backup";
import { EMPTY_LOCAL, useKhataStore } from "@/features/khata/store/khata-store";
import { localDate } from "@/lib/date-format";
import { toast } from "@/lib/toast";

/** Warns that Udhaar + parties are saved on this phone only, and offers a backup file as the safety net. */
export function LocalOnlyNote() {
    const { t } = useTranslation("khata", { keyPrefix: "backup" });
    const { dataMode } = useBusinessData();
    const businessId = useBusinessStore((s) => s.activeId);
    const local = useKhataStore((s) => s.data[businessId] ?? EMPTY_LOCAL);
    const restoreLocalData = useKhataStore((s) => s.restoreLocalData);
    const [guideOpen, setGuideOpen] = useState(false);

    if (dataMode !== "blank") return null; // demo data is a practice copy, nothing to protect

    const backUp = async () => {
        if (local.entries.length + local.parties.length === 0) return toast(t("nothing"));
        try {
            await deliverFile(
                { name: `khata-backup-${localDate()}.json`, mime: MIME.json, data: JSON.stringify(buildBackup(local.entries, local.parties)) },
                "share", // the share sheet lets the user send it to Drive, Files or WhatsApp
            );
        } catch (e) {
            console.warn("backup failed", e);
            toast.error(t("failed"));
        }
    };

    const restore = async () => {
        try {
            // the picker sends the app to the background: pause the PIN auto-lock meanwhile
            const res = await suspendLockWhile(() => DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true }));
            if (res.canceled) return;
            const parsed = parseBackup(await (await fetch(res.assets[0].uri)).text());
            if (!parsed) return toast.error(t("invalid"));
            const added = restoreLocalData(parsed);
            if (added.entries + added.parties === 0) toast(t("upToDate"));
            else toast.success(t("restored", added));
        } catch (e) {
            console.warn("restore failed", e);
            toast.error(t("invalid"));
        }
    };

    return (
        <>
            <View className="mx-4 mt-4 rounded-brand-12 border border-warning/25 bg-warning-bg p-3">
                <View className="flex-row items-center gap-2">
                    <View className="h-7 w-7 items-center justify-center rounded-brand-8 bg-white">
                        <ShieldCheck size={15} className="text-warning" strokeWidth={2} />
                    </View>
                    <Text className="flex-1 font-jakarta-bold text-xs text-text-dark">{t("title")}</Text>
                    <Pressable
                        accessibilityRole="link"
                        onPress={() => setGuideOpen(true)}
                        hitSlop={8}
                        className="flex-row items-center active:opacity-70">
                        <Text className="font-jakarta-semibold text-[10px] text-text-secondary">{t("howTo")}</Text>
                        <ChevronRight size={12} className="text-text-secondary" strokeWidth={2} />
                    </Pressable>
                </View>
                <Text className="mt-2 font-jakarta text-xs leading-4 text-text-secondary">{t("note")}</Text>
                <View className="mt-3 flex-row gap-2">
                    <Pressable
                        accessibilityRole="button"
                        onPress={backUp}
                        className="min-h-10 flex-1 items-center justify-center rounded-brand-8 bg-primary px-3 active:opacity-85">
                        <Text className="font-jakarta-semibold text-xs text-white">{t("backup")}</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        onPress={restore}
                        className="min-h-10 flex-1 items-center justify-center rounded-brand-8 border border-border-strong bg-white px-3 active:bg-page-bg">
                        <Text className="font-jakarta-semibold text-xs text-text-secondary">{t("restore")}</Text>
                    </Pressable>
                </View>
            </View>
            <BackupGuideSheet visible={guideOpen} onClose={() => setGuideOpen(false)} />
        </>
    );
}