// nativeApp\src\features\party\components\balance-text.tsx

import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { pkr } from "@/features/khata/lib/debt";
import { cn } from "@/lib/cn";

export function BalanceText({ value, hidden }: { value: number; hidden?: boolean }) {
    const { t: tr } = useTranslation("party", { keyPrefix: "balance" });
    const t =
        value > 0
            ? { amt: "text-danger", chipBg: "bg-danger-bg", chipText: "text-danger", label: tr("youWillGet") }
            : value < 0
                ? { amt: "text-success", chipBg: "bg-success-bg", chipText: "text-success", label: tr("youWillGive") }
                : { amt: "text-text-secondary", chipBg: "bg-page-bg", chipText: "text-text-secondary", label: tr("settled") };

    return (
        <View className="items-end gap-0.5">
            <Text className={cn("font-jakarta-bold text-sm", t.amt)}>
                {hidden ? "Rs ••••" : pkr(Math.abs(value))}
            </Text>
            <View className={cn("rounded-full px-2 py-0.5", t.chipBg)}>
                <Text className={cn("font-jakarta-medium text-[11px]", t.chipText)}>{t.label}</Text>
            </View>
        </View>
    );
}