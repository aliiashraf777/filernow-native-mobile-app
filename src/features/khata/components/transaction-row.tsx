// nativeApp\src\features\khata\components\transaction-row.tsx

import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { cashFlow, pkr } from "@/features/khata/lib/debt";
import type { EntryKind, IExpenseEntry } from "@/features/khata/types/types";
import { cn } from "@/lib/cn";
import { entryDateTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

const KIND: Record<EntryKind, { badge: string; text: string }> = {
    expense: { badge: "bg-danger-bg", text: "text-danger" },
    income: { badge: "bg-success-bg", text: "text-success" },
    debt: { badge: "bg-warning-bg", text: "text-warning" },
};

type Props = {
    entry: IExpenseEntry;
    categoryLabel: string;
    onDelete: (entry: IExpenseEntry) => void;
    /** Omit for entries that are edited elsewhere (udhaar entries are edited in the Party screen). */
    onEdit?: (entry: IExpenseEntry) => void;
};

export function TransactionRow({ entry, categoryLabel, onDelete, onEdit }: Props) {
    const { t } = useTranslation("khata");
    const kind = KIND[entry.kind];
    // +1 money in, -1 money out, 0 no cash moved (forgiven udhaar): no sign
    const flow = cashFlow(entry);

    return (
        <View className="flex-row items-center gap-3 border-b border-border-clr bg-white px-4 py-3">
            <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-jakarta-semibold text-sm text-text-dark">
                    {entry.subject}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                    <View className={cn("rounded-full px-2 py-0.5", kind.badge)}>
                        <Text className={cn("font-jakarta-semibold text-[11px]", kind.text)}>{t(`kind.${entry.kind}`)}</Text>
                    </View>
                    <Text numberOfLines={1} className="flex-1 font-jakarta text-xs text-text-secondary-muted">
                        {categoryLabel} · {entryDateTime(entry)}
                    </Text>
                </View>
            </View>
            <Text className={cn("font-jakarta-bold text-sm", flow > 0 ? "text-success" : flow < 0 && entry.kind === "debt" ? "text-danger" : "text-text-secondary")}>
                {flow > 0 ? "+" : flow < 0 ? "-" : ""}
                {pkr(entry.amount)}
            </Text>
            {onEdit ? (
                <Pressable accessibilityRole="button" accessibilityLabel={t("row.edit")} onPress={() => onEdit(entry)} hitSlop={10}>
                    <SymbolView name={{ ios: "pencil", android: "edit", web: "edit" }} size={17} tintColor={colors["text-secondary"]} />
                </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" accessibilityLabel={t("row.delete")} onPress={() => onDelete(entry)} hitSlop={10}>
                <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} size={17} tintColor={colors["text-secondary-muted"]} />
            </Pressable>
        </View>
    );
}