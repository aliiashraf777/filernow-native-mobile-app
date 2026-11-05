// nativeApp\src\features\khata\screens\khata-screen.tsx

import { Link, type Href } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { DataModeBar } from "@/features/khata/components/data-mode-bar";

import { colors } from "@/theme/tokens";

/** Title and description live in khata:sections.<key>. */
type Section = { key: "daily" | "business" | "udhaar" | "party"; href: Href; icon: SymbolViewProps["name"] };

const SECTIONS: Section[] = [
    {
        key: "daily",
        href: "/khata/daily",
        icon: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
    },
    {
        key: "business",
        href: "/khata/business",
        icon: { ios: "briefcase.fill", android: "work", web: "work" },
    },
    {
        key: "udhaar",
        href: "/khata/udhaar",
        icon: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
    },
    {
        key: "party",
        href: "/khata/party",
        icon: { ios: "person.2.fill", android: "groups", web: "groups" },
    },
];

export default function KhataCardScreen() {
    const { t } = useTranslation("khata");
    return (
        <ScrollView className="flex-1 bg-page-bg">
            <DataModeBar />
            <View className="flex-row flex-wrap gap-3 p-4">
                {SECTIONS.map((s) => (
                    <Link key={s.key} href={s.href} asChild>
                        <Pressable
                            accessibilityRole="button"
                            className="min-h-[132px] grow basis-[47%] justify-between rounded-brand-16 border border-border-clr bg-white p-4 active:opacity-80">
                            <View className="h-10 w-10 items-center justify-center rounded-brand-12 bg-primary-lighter">
                                <SymbolView name={s.icon} size={20} tintColor={colors.primary} />
                            </View>
                            <View>
                                <Text className="font-jakarta-bold text-base text-text-dark">{t(`sections.${s.key}.title`)}</Text>
                                <Text className="mt-1 font-jakarta text-xs leading-[18px] text-text-secondary">
                                    {t(`sections.${s.key}.description`)}
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                ))}
            </View>
        </ScrollView>
    );
}