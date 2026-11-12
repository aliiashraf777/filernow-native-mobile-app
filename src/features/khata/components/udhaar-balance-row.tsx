// nativeApp\src\features\khata\components\udhaar-balance-row.tsx

import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { pkr } from "@/features/khata/lib/debt";
import { cn } from "@/lib/cn";

type Props = { name: string; balance: number; onPress?: () => void };

/** One party line: name + what you will get / give. balance > 0 = they owe you. */
export function UdhaarBalanceRow({ name, balance, onPress }: Props) {
    const { t } = useTranslation("khata", { keyPrefix: "udhaar.balances" });
    const get = balance > 0;

    return (
        <Pressable
            accessibilityRole={onPress ? "button" : undefined}
            disabled={!onPress}
            onPress={onPress}
            className="min-h-12 flex-row items-center justify-between gap-3 rounded-brand-8 border border-border-clr px-3 active:bg-page-bg">
            <Text numberOfLines={1} className="flex-1 font-jakarta-semibold text-sm text-text-dark">
                {name}
            </Text>
            <View className="items-end">
                <Text className={cn("font-jakarta-bold text-sm", get ? "text-success" : "text-danger")}>{pkr(Math.abs(balance))}</Text>
                <Text className="font-jakarta text-[11px] text-text-secondary-muted">{get ? t("get") : t("give")}</Text>
            </View>
        </Pressable>
    );
}