// nativeApp\src\features\app-lock\components\app-lock-gate.tsx

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, BackHandler, StyleSheet, View } from "react-native";

import LoginPinScreen from "@/features/auth/components/login-pin-screen";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useAppStore } from "@/stores/app-store";

import { useLockOnBackground } from "../hooks/use-lock-on-background";
import { useAppLockStore } from "../store/app-lock-store";

/** Covers the whole app with the PIN / biometric screen while it is locked. */
export function AppLockGate() {
    const { t } = useTranslation(["common", "auth"]);
    const phone = useAuthStore((s) => s.phone);
    const logout = useLogout();
    const appLock = useAppStore((s) => s.appLock);
    const locked = useAppLockStore((s) => s.locked);
    const unlock = useAppLockStore((s) => s.unlock);
    const showing = locked && appLock && phone !== null;

    useLockOnBackground();

    // Android back button must not reach the screens underneath
    useEffect(() => {
        if (!showing) return;
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
        return () => subscription.remove();
    }, [showing]);

    if (!showing) return null;

    const confirmLogout = () =>
        Alert.alert(t("auth:appLock.changeNumberTitle"), t("auth:appLock.changeNumberMessage"), [
            { text: t("actions.cancel"), style: "cancel" },
            {
                text: t("actions.logOut"),
                style: "destructive",
                onPress: () => {
                    logout();
                    unlock();
                },
            },
        ]);

    return (
        <View style={StyleSheet.absoluteFill}>
            <LoginPinScreen
                phone={phone}
                onChangeNumber={confirmLogout}
                // let the success line show for a moment
                onSuccess={() => setTimeout(unlock, 300)}
            />
        </View>
    );
}
