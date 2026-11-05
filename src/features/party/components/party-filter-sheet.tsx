// nativeApp\src\features\party\components\party-filter-sheet.tsx

import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

export type BalanceFilter = "all" | "get" | "give" | "settled";
export type SortBy = "recent" | "name" | "balance";

// labels: party:filter.<value>
const BALANCE_FILTERS: BalanceFilter[] = ["all", "get", "give", "settled"];
const SORTS: SortBy[] = ["recent", "name", "balance"];

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={onPress}
            className="min-h-12 flex-row items-center justify-between border-b border-border-clr active:bg-page-bg">
            <Text className={cn("font-jakarta-medium text-sm", selected ? "text-primary" : "text-text-dark")}>{label}</Text>
            {selected ? (
                <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={16} tintColor={colors.primary} />
            ) : null}
        </Pressable>
    );
}

type Props = {
    visible: boolean;
    balanceFilter: BalanceFilter;
    sortBy: SortBy;
    onBalanceChange: (v: BalanceFilter) => void;
    onSortChange: (v: SortBy) => void;
    onReset: () => void;
    onClose: () => void;
};

export function PartyFilterSheet({ visible, balanceFilter, sortBy, onBalanceChange, onSortChange, onReset, onClose }: Props) {
    const { t } = useTranslation("party", { keyPrefix: "filter" });
    const active = balanceFilter !== "all" || sortBy !== "recent";
    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("title")}>
            <Text className="mb-1 font-jakarta-semibold text-xs text-text-secondary-muted">{t("byBalance")}</Text>
            {BALANCE_FILTERS.map((f) => (
                <Option key={f} label={t(f)} selected={balanceFilter === f} onPress={() => onBalanceChange(f)} />
            ))}
            <Text className="mb-1 mt-4 font-jakarta-semibold text-xs text-text-secondary-muted">{t("sort")}</Text>
            {SORTS.map((s) => (
                <Option key={s} label={t(s)} selected={sortBy === s} onPress={() => onSortChange(s)} />
            ))}
            {active ? (
                <View className="mt-3 items-center">
                    <Pressable accessibilityRole="button" onPress={onReset} className="min-h-11 justify-center px-4">
                        <Text className="font-jakarta-bold text-sm text-primary">{t("reset")}</Text>
                    </Pressable>
                </View>
            ) : null}
        </BottomSheet>
    );
}