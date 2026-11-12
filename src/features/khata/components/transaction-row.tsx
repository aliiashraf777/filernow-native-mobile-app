// nativeApp\src\features\khata\components\transaction-row.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { debtSign, pkr } from "@/features/khata/lib/debt";
import type { EntryKind, IExpenseEntry } from "@/features/khata/types";
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
    const kind = KIND[entry.kind];
    // const income = entry.kind === "income";
    // money coming in: income, or a "You Got" udhaar type (same rule as the web dashboard)
    const credit = entry.kind === "income" || debtSign(entry) < 0;

    return (
        <View className="flex-row items-center gap-3 border-b border-border-clr bg-white px-4 py-3">
            <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="font-jakarta-semibold text-sm text-text-dark">
                    {entry.subject}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                    <View className={cn("rounded-full px-2 py-0.5", kind.badge)}>
                        <Text className={cn("font-jakarta-semibold text-[11px] capitalize", kind.text)}>{entry.kind}</Text>
                    </View>
                    <Text numberOfLines={1} className="flex-1 font-jakarta text-xs text-text-secondary-muted">
                        {categoryLabel} · {entryDateTime(entry)}
                    </Text>
                </View>
            </View>
            <Text className={cn("font-jakarta-bold text-sm", credit ? "text-success" : "text-text-secondary")}>
                {credit ? "+" : "-"}
                {pkr(entry.amount)}
            </Text>
            {onEdit ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Edit entry" onPress={() => onEdit(entry)} hitSlop={10}>
                    <SymbolView name={{ ios: "pencil", android: "edit", web: "edit" }} size={17} tintColor={colors["text-secondary"]} />
                </Pressable>
            ) : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Delete entry" onPress={() => onDelete(entry)} hitSlop={10}>
                <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} size={17} tintColor={colors["text-secondary-muted"]} />
            </Pressable>
        </View>
    );
}