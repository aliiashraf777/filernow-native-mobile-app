// nativeApp\src\features\khata\components\transaction-row.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { pkr } from "@/features/khata/lib/debt";
import type { EntryKind, IExpenseEntry } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { entryDateTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

const KIND: Record<EntryKind, { badge: string; text: string }> = {
    expense: { badge: "bg-danger-bg", text: "text-danger" },
    income: { badge: "bg-success-bg", text: "text-success" },
    debt: { badge: "bg-warning-bg", text: "text-warning" },
};

type Props = { entry: IExpenseEntry; categoryLabel: string; onDelete: (entry: IExpenseEntry) => void };

export function TransactionRow({ entry, categoryLabel, onDelete }: Props) {
    const kind = KIND[entry.kind];
    const income = entry.kind === "income";

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
            <Text className={cn("font-jakarta-bold text-sm", income ? "text-success" : "text-text-secondary")}>
                {income ? "+" : "-"}
                {pkr(entry.amount)}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Delete entry" onPress={() => onDelete(entry)} hitSlop={10}>
                <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} size={17} tintColor={colors["text-secondary-muted"]} />
            </Pressable>
        </View>
    );
}