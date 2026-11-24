// nativeApp\src\features\khata\components\local-only-note.tsx

import * as DocumentPicker from "expo-document-picker";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { suspendLockWhile } from "@/features/app-lock/lib/lock-suspension";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { MIME, deliverFile } from "@/features/khata/lib/export-file";
import { buildBackup, parseBackup } from "@/features/khata/lib/khata-backup";
import { EMPTY_LOCAL, useKhataStore } from "@/features/khata/store/khata-store";
import { localDate } from "@/lib/date-format";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";

/** Warns that Udhaar + parties are saved on this phone only, and offers a backup file as the safety net. */
export function LocalOnlyNote() {
    const { t } = useTranslation("khata", { keyPrefix: "backup" });
    const { dataMode } = useBusinessData();
    const businessId = useBusinessStore((s) => s.activeId);
    const local = useKhataStore((s) => s.data[businessId] ?? EMPTY_LOCAL);
    const restoreLocalData = useKhataStore((s) => s.restoreLocalData);

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
        <View className="mx-4 mt-4 rounded-brand-12 border border-warning/25 bg-warning-bg p-3">
            <View className="flex-row items-start gap-2">
                <SymbolView name={{ ios: "iphone", android: "smartphone", web: "smartphone" }} size={16} tintColor={colors.warning} />
                <Text className="flex-1 font-jakarta text-xs leading-4 text-text-secondary">{t("note")}</Text>
            </View>
            <View className="mt-3 flex-row gap-2">
                <Pressable accessibilityRole="button" onPress={backUp} className="min-h-10 flex-1 items-center justify-center rounded-brand-8 bg-white active:opacity-80">
                    <Text className="font-jakarta-semibold text-xs text-text-secondary">{t("backup")}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={restore} className="min-h-10 flex-1 items-center justify-center rounded-brand-8 bg-white active:opacity-80">
                    <Text className="font-jakarta-semibold text-xs text-text-secondary">{t("restore")}</Text>
                </Pressable>
            </View>
        </View>
    );
}