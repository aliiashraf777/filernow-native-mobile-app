// nativeApp\src\features\party\components\party-row.tsx

import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import type { IParty } from "@/features/khata/types";
import { BalanceText } from "@/features/party/components/balance-text";
import { colors } from "@/theme/tokens";

type Props = {
    party: IParty;
    balance: number;
    lastLabel: string;
    hidden: boolean;
    onPress: () => void;
    onMenu: () => void;
};

export function PartyRow({ party, balance, lastLabel, hidden, onPress, onMenu }: Props) {
    const { t } = useTranslation("party");
    const initials = party.name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            onLongPress={onMenu}
            className="flex-row items-center gap-3 border-b border-border-clr bg-white px-4 py-3 active:bg-page-bg">
            <View className="h-11 w-11 items-center justify-center rounded-brand-12 bg-page-bg">
                <Text className="font-jakarta-bold text-sm text-primary">{initials}</Text>
            </View>
            <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-jakarta-semibold text-sm text-text-dark">
                    {party.name}
                </Text>
                <Text numberOfLines={1} className="font-jakarta text-xs text-text-secondary-muted">
                    {party.phone ?? t("noNumber")} · {lastLabel}
                </Text>
            </View>
            <BalanceText value={balance} hidden={hidden} />
            <Pressable accessibilityRole="button" accessibilityLabel={t("list.optionsA11y")} onPress={onMenu} hitSlop={12}>
                <SymbolView
                    name={{ ios: "ellipsis", android: "more_vert", web: "more_vert" }}
                    size={18}
                    tintColor={colors["text-secondary-muted"]}
                />
            </Pressable>
        </Pressable>
    );
}