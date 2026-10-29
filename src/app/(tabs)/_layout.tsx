// nativeApp\src\app\(tabs)\_layout.ts

import { Redirect, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { AppHeader } from "@/components/header/app-header";
import { useAuthStore } from "@/features/auth/store/auth-store";

import { colors } from "@/theme/tokens";

type TabDef = { name: string; title: string; icon: SymbolViewProps["name"] };

const TABS: TabDef[] = [
    { name: "home", title: "Home", icon: { ios: "house.fill", android: "home", web: "home" } },
    { name: "khata", title: "Khata", icon: { ios: "book.closed.fill", android: "menu_book", web: "menu_book" } },
    { name: "settings", title: "Settings", icon: { ios: "gearshape.fill", android: "settings", web: "settings" } },
];

export default function TabsLayout() {
    const isSignedIn = useAuthStore((s) => s.phone !== null);
    if (!isSignedIn) return <Redirect href="/" />;
    
    return (
        <>
        {/* Dark icons on the light header (auth screens switch it to light). */}
        <StatusBar style="light"/>
        <Tabs
            screenOptions={{
                header: () => <AppHeader />,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors["text-secondary"],
                tabBarStyle: { borderTopColor: colors["border-clr"] },
                tabBarLabelStyle: { fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 11 },
            }}
        >
            {TABS.map(({ name, title, icon }) => (
                <Tabs.Screen
                    key={name}
                    name={name}
                    options={{
                        title,
                        tabBarIcon: ({ color, size }) => <SymbolView name={icon} tintColor={color} size={size} />
                    }}
                />
            ))}
        </Tabs>
        </>
    );
}