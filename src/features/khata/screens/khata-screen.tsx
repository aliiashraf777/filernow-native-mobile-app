// nativeApp\src\features\khata\screens\khata-screen.tsx

import { Link, type Href } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DataModeBar } from "@/features/khata/components/data-mode-bar"

import { colors } from "@/theme/tokens";

type Section = { title: string; description: string; href: Href; icon: SymbolViewProps["name"] };

const SECTIONS: Section[] = [
    {
        title: "Daily Khata",
        description: "Record your daily sales and spending.",
        href: "/khata/daily",
        icon: { ios: "calendar", android: "calendar_today", web: "calendar_today" },
    },
    {
        title: "Business Khata",
        description: "Track stock, bills and cash in one place.",
        href: "/khata/business",
        icon: { ios: "briefcase.fill", android: "work", web: "work" },
    },
    {
        title: "Udhaar Khata",
        description: "Manage credit given and payments due.",
        href: "/khata/udhaar",
        icon: { ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" },
    },
    {
        title: "Party",
        description: "Customers and suppliers, with balances.",
        href: "/khata/party",
        icon: { ios: "person.2.fill", android: "groups", web: "groups" },
    },
];

export default function KhataCardScreen() {
    return (
        <ScrollView className="flex-1 bg-page-bg">
            <DataModeBar />
            <View className="flex-row flex-wrap gap-3 p-4">
                {SECTIONS.map((s) => (
                    <Link key={s.title} href={s.href} asChild>
                        <Pressable
                            accessibilityRole="button"
                            className="min-h-[132px] grow basis-[47%] justify-between rounded-brand-16 border border-border-clr bg-white p-4 active:opacity-80">
                            <View className="h-10 w-10 items-center justify-center rounded-brand-12 bg-primary-lighter">
                                <SymbolView name={s.icon} size={20} tintColor={colors.primary} />
                            </View>
                            <View>
                                <Text className="font-jakarta-bold text-base text-text-dark">{s.title}</Text>
                                <Text className="mt-1 font-jakarta text-xs leading-[18px] text-text-secondary">
                                    {s.description}
                                </Text>
                            </View>
                        </Pressable>
                    </Link>
                ))}
            </View>
        </ScrollView>
    );
}