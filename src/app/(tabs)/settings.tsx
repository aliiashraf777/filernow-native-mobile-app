// nativeApp\src\app\(tabs)\settings.tsx

import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

import { useLogout } from "@/features/auth/hooks/use-logout";
import { maskPhone } from "@/features/auth/lib/phone";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { BiometricToggleRow } from "@/features/biometric/components/biometric-toggle-row";

export default function Settings() {
    const { t } = useTranslation(["common", "auth", "more"]);
    const phone = useAuthStore((s) => s.phone);
    const logout = useLogout();

    const confirmLogout = () =>
        Alert.alert(t("auth:logout.title"), t("auth:logout.message"), [
            { text: t("actions.cancel"), style: "cancel" },
            { text: t("actions.logOut"), style: "destructive", onPress: logout },
        ]);

    return (
        <View className="flex-1 bg-page-bg">
            <View className="p-4">
                <Text className="font-jakarta-extrabold text-xl text-text-dark">{t("more:settingsTitle")}</Text>
                {phone ? (
                    <Text className="mt-1 font-jakarta text-sm text-text-secondary">{maskPhone(phone)}</Text>
                ) : null}

                <BiometricToggleRow phone={phone} className="mt-6" />

                <Pressable
                    accessibilityRole="button"
                    onPress={confirmLogout}
                    className="mt-6 min-h-12 items-center justify-center rounded-brand-8 border border-red-600 bg-red-50 active:opacity-80">
                    <Text className="font-jakarta-bold text-sm text-red-600">{t("actions.logOut")}</Text>
                </Pressable>
            </View>
        </View>
    );
}
