// nativeApp\src\features\business\components\business-row.tsx

import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { GradientFill, PRIMARY_GRADIENT } from "@/components/ui/gradient-fill";
import { BUSINESS_TYPES, type IBusiness } from "@/features/business/data/business-options";
import { businessName } from "@/features/business/lib/business-name";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

import { BusinessIcon } from "./business-icon";

type Props = {
    business: IBusiness;
    selected: boolean;
    onPress: (id: string) => void;
};

/** One selectable card in the "Switch Business" sheet. */
export function BusinessRow({ business, selected, onPress }: Props) {
    const { t } = useTranslation("business");
    const name = businessName(business);
    const caption = t(`types.${business.type}.caption`);

    return (
        <Pressable
            onPress={() => onPress(business.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t("rowA11y", { name, type: caption, currency: business.currency })}
            className={cn(
                "flex-row items-center gap-4 rounded-brand-24 border p-3 pr-4 active:opacity-80",
                selected ? "border-[#F1A7B5] bg-[#FFF2F4]" : "border-[#ECE7E5] bg-[#F7F5F4]",
            )}>
            <View
                className="h-[60px] w-[60px] items-center justify-center rounded-[18px]"
                style={{ backgroundColor: BUSINESS_TYPES[business.type].tint }}>
                <BusinessIcon type={business.type} size={34} />
            </View>

            <View className="flex-1">
                <Text numberOfLines={1} className="font-jakarta-semibold text-text-dark" style={{ fontSize: 17, lineHeight: 24 }}>
                    {name}
                </Text>
                <Text className="mt-1 font-jakarta text-para-small text-[#8A8285]">
                    {caption} · {business.currency}
                </Text>
            </View>

            {selected ? (
                <View
                    className="h-7 w-7 rounded-full bg-primary"
                    style={{
                        shadowColor: colors.primary,
                        shadowOpacity: 0.35,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 3,
                    }}>
                    <View className="flex-1 items-center justify-center overflow-hidden rounded-full">
                        <GradientFill colors={PRIMARY_GRADIENT} />
                        <Check size={15} color="#fff" strokeWidth={3.2} />
                    </View>
                </View>
            ) : (
                <View className="h-7 w-7 rounded-full border-2 border-[#DCD6D4]" />
            )}
        </Pressable>
    );
}
