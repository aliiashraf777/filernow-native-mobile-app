// nativeApp\src\app\(tabs)\_layout.ts

import { Redirect, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

import { AppHeader } from "@/components/header/app-header";
import { AppTabBar, TAB_DEFS } from "@/components/tab-bar/app-tab-bar";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function TabsLayout() {
    const { t } = useTranslation();
    const isSignedIn = useAuthStore((s) => s.phone !== null);
    if (!isSignedIn) return <Redirect href="/welcome" />;

    return (
        <>
            {/* Dark icons on the light header (auth screens switch it to light). */}
            <StatusBar style="light" />
            <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ header: () => <AppHeader /> }}>
                {TAB_DEFS.map(({ name, labelKey }) => (
                    <Tabs.Screen key={name} name={name} options={{ title: t(`tabs.${labelKey}`) }} />
                ))}
                {/* Still routable, but not in the bar (logout etc. live on the More page now). */}
                <Tabs.Screen name="settings" options={{ href: null }} />
            </Tabs>
        </>
    );
}
