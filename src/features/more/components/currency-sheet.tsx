// nativeApp\src\features\more\components\currency-sheet.tsx

import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CURRENCIES, type CurrencyCode } from "@/features/business/data/business-options";
import { businessName } from "@/features/business/lib/business-name";
import { useActiveBusiness, useBusinessStore } from "@/features/business/store/business-store";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

type Props = { visible: boolean; onClose: () => void };

/** Changes the currency of the active business. */
export function CurrencySheet({ visible, onClose }: Props) {
    const { t } = useTranslation("business");
    const business = useActiveBusiness();
    const name = businessName(business);
    const updateBusiness = useBusinessStore((s) => s.updateBusiness);

    const pick = (code: CurrencyCode) => {
        if (code !== business.currency) {
            updateBusiness(business.id, { currency: code });
            toast.success(t("currencySheet.changed", { name, code }));
        }
        onClose();
    };

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("currencySheet.title")} subtitle={t("currencySheet.subtitle", { name })}>
            <View className="gap-2.5">
                {CURRENCIES.map((c) => {
                    const selected = c.code === business.currency;
                    return (
                        <Pressable
                            key={c.code}
                            onPress={() => pick(c.code)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            className={cn(
                                "h-16 flex-row items-center gap-3 rounded-brand-24 border px-4 active:opacity-80",
                                selected ? "border-[#F1A7B5] bg-[#FFF2F4]" : "border-[#ECE7E5] bg-[#F7F5F4]",
                            )}>
                            <Text allowFontScaling={false} style={{ fontSize: 24 }}>
                                {c.flag}
                            </Text>
                            <Text className="flex-1 font-jakarta-medium text-text-dark" style={{ fontSize: 16 }}>
                                {t(`currencies.${c.code}`)} ({c.code})
                            </Text>
                            {selected ? <Check size={20} color="#C8102E" strokeWidth={3} /> : null}
                        </Pressable>
                    );
                })}
            </View>
        </BottomSheet>
    );
}
