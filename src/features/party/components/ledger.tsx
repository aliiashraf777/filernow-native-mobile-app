// nativeApp\src\features\party\components\ledger.tsx

import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { type LedgerRow, debtLabel, pkr } from "@/features/khata/lib/debt";
import type { IExpenseEntry } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { entryDateTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

const AMOUNT_COL = "w-[84px]";

export function LedgerHeader({ count }: { count: number }) {
    const { t } = useTranslation("party", { keyPrefix: "ledger" });
    return (
        <View className="flex-row border-b border-border-clr bg-white">
            <Text className="flex-1 px-3 py-2 font-jakarta-semibold text-xs text-text-secondary">{t("entries", { count })}</Text>
            <Text className={cn(AMOUNT_COL, "bg-danger-bg px-3 py-2 text-right font-jakarta-semibold text-xs text-danger")}>{t("gave")}</Text>
            <Text className={cn(AMOUNT_COL, "bg-success-bg px-3 py-2 text-right font-jakarta-semibold text-xs text-success")}>{t("got")}</Text>
        </View>
    );
}

type Props = {
    row: LedgerRow;
    onEdit?: (entry: IExpenseEntry) => void;
    onDelete?: (entry: IExpenseEntry) => void;
};

export function LedgerRowItem({ row: { entry, sign, balance }, onEdit, onDelete }: Props) {
    const { t } = useTranslation("party", { keyPrefix: "ledger" });
    const amount = entry.amount.toLocaleString("en-PK");
    const chip =
        balance > 0 ? ["bg-danger-bg", "text-danger"] : balance < 0 ? ["bg-success-bg", "text-success"] : ["bg-page-bg", "text-text-secondary"];

    return (
        <View className="flex-row border-b border-border-clr bg-white">
            <View className="min-w-0 flex-1 px-3 py-2.5">
                <Text className="font-jakarta text-[11px] text-text-secondary-muter">{entryDateTime(entry)}</Text>
                <Text numberOfLines={1} className="font-jakarta-semibold text-sm text-text-dark">{debtLabel(entry.categoryId)}</Text>
                {entry.description ? (
                    <Text numberOfLines={1} className="font-jakarta text-xs text-text-secondary-muted">{entry.description}</Text>
                ) : null}
                <View className="mt-1 flex-row items-center gap-3">
                    <View className={cn("rounded-brand-8 px-1.5 py-0.5", chip[0])}>
                        <Text className={cn("font-jakarta-medium text-[11px]", chip[1])}>{t("balance", { amount: pkr(Math.abs(balance)) })}</Text>
                    </View>
                    {onEdit ? (
                        <Pressable accessibilityRole="button" accessibilityLabel={t("editA11y")} onPress={() => onEdit(entry)} hitSlop={10}>
                            <SymbolView name={{ ios: "pencil", android: "edit", web: "edit" }} size={15} tintColor={colors["text-secondary"]} />
                        </Pressable>
                    ) : null}
                    {onDelete ? (
                        <Pressable accessibilityRole="button" accessibilityLabel={t("deleteA11y")} onPress={() => onDelete(entry)} hitSlop={10}>
                            <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} size={15} tintColor={colors["text-secondary-muted"]} />
                        </Pressable>
                    ) : null}
                </View>
            </View>
            <View className={cn(AMOUNT_COL, "items-end justify-center bg-danger-bg/50 px-3")}>
                {sign > 0 ? <Text className="font-jakarta-bold text-sm text-danger">{amount}</Text> : null}
            </View>
            <View className={cn(AMOUNT_COL, "items-end justify-center bg-success-bg/50 px-3")}>
                {sign < 0 ? <Text className="font-jakarta-bold text-sm text-success">{amount}</Text> : null}
            </View>
        </View>
    );
}