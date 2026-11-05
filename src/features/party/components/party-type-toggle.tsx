// nativeApp\src\features\party\components\party-type-toggle.tsx

import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { PARTY_TYPES, type PartyType } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const ICON: Record<PartyType, SymbolViewProps["name"]> = {
    customer: { ios: "person.fill", android: "person", web: "person" },
    supplier: { ios: "shippingbox.fill", android: "local_shipping", web: "local_shipping" },
};

type Props = { value: PartyType; onChange: (t: PartyType) => void; showHints?: boolean };

export function PartyTypeToggle({ value, onChange, showHints }: Props) {
    const { t: tr } = useTranslation("party");
    return (
        <View className="flex-row gap-2">
            {PARTY_TYPES.map((t) => {
                const active = value === t;
                return (
                    <Pressable
                        key={t}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        onPress={() => onChange(t)}
                        className={cn(
                            "flex-1 rounded-brand-8 border p-3",
                            active ? "border-primary bg-primary-tint" : "border-border-clr bg-page-bg",
                        )}>
                        <View className="flex-row items-center gap-1.5">
                            <SymbolView
                                name={ICON[t]}
                                size={15}
                                tintColor={active ? colors.primary : colors["text-secondary"]}
                            />
                            <Text className="font-jakarta-semibold text-sm text-text-dark">{tr(`types.${t}`)}</Text>
                        </View>
                        {showHints ? (
                            <Text className="mt-1 font-jakarta text-[11px] text-text-secondary-muter">{tr(`typeHints.${t}`)}</Text>
                        ) : null}
                    </Pressable>
                );
            })}
        </View>
    );
}