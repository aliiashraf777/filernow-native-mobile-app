// nativeApp\src\features\app-lock\components\app-lock-toggle-row.tsx

import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { emIcons } from "@/constants/expense-manager-icons";
import { useToast } from "@/lib/toast";
import { useAppStore } from "@/stores/app-store";

/** "Lock with PIN" on/off, with a toast confirming the change. */
export function AppLockToggleRow() {
    const appLock = useAppStore((s) => s.appLock);
    const setAppLock = useAppStore((s) => s.setAppLock);
    const toast = useToast();
    const { t } = useTranslation("auth", { keyPrefix: "appLock" });

    const toggle = (on: boolean) => {
        setAppLock(on);
        if (on) toast.success(t("turnedOn"), { description: t("turnedOnDescription") });
        else toast.success(t("turnedOff"), { description: t("turnedOffDescription") });
    };

    return (
        <View className="flex-row items-center gap-4 rounded-brand-24 border border-[#ECE7E5] bg-[#F7F5F4] p-4">
            <View className="h-12 w-12 items-center justify-center rounded-brand-16 bg-[#FFF4DC]">
                <Image source={emIcons.appLock} contentFit="contain" style={{ width: 28, height: 28 }} />
            </View>
            <View className="flex-1">
                <Text className="font-jakarta-semibold text-text-dark" style={{ fontSize: 16 }}>
                    {t("rowTitle")}
                </Text>
                <Text className="mt-0.5 font-jakarta text-para-small text-[#8A8285]">
                    {t("rowSubtitle")}
                </Text>
            </View>
            <ToggleSwitch value={appLock} onValueChange={toggle} accessibilityLabel={t("title")} />
        </View>
    );
}
