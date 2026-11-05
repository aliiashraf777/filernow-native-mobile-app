// nativeApp\src\features\language\components\language-row.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import type { AppLanguage, AppLanguageConfig } from "@/i18n/languages";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const CHECKED = { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" } as const;
const UNCHECKED = {
    ios: "circle",
    android: "radio_button_unchecked",
    web: "radio_button_unchecked",
} as const;

type Props = { language: AppLanguageConfig; selected: boolean; onPress: (code: AppLanguage) => void };

/** One language option: badge, native name (e.g. "اردو") with the English name under it, radio mark. */
export function LanguageRow({ language, selected, onPress }: Props) {
    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${language.nativeName}, ${language.name}`}
            onPress={() => onPress(language.code)}
            className={cn(
                "min-h-[62px] flex-row items-center rounded-2xl border px-4",
                selected ? "border-primary bg-primary-tint" : "border-border-clr bg-white",
            )}>
            <View
                className={cn(
                    "me-3 h-10 w-10 items-center justify-center rounded-xl",
                    selected ? "bg-primary" : "bg-surface-muted",
                )}>
                <Text
                    className={cn("font-jakarta-bold text-xs", selected ? "text-white" : "text-text-secondary")}>
                    {language.badge}
                </Text>
            </View>

            <View className="me-3 flex-1">
                <Text className="font-jakarta-semibold text-[15px] text-text-dark">{language.nativeName}</Text>
                {language.nativeName !== language.name ? (
                    <Text className="font-jakarta text-xs text-text-secondary">{language.name}</Text>
                ) : null}
            </View>

            <SymbolView
                name={selected ? CHECKED : UNCHECKED}
                tintColor={selected ? colors.primary : colors["border-strong"]}
                size={22}
            />
        </Pressable>
    );
}
