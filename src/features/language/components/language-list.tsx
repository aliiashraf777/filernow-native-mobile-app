// nativeApp\src\features\language\components\language-list.tsx

import { View } from "react-native";

import { APP_LANGUAGES, type AppLanguage } from "@/i18n/languages";

import { LanguageRow } from "./language-row";

type Props = { selectedCode: AppLanguage; onSelect: (code: AppLanguage) => void; className?: string };

/** All supported languages as a radio group. */
export function LanguageList({ selectedCode, onSelect, className }: Props) {
    return (
        <View accessibilityRole="radiogroup" className={`gap-2 ${className ?? ""}`}>
            {APP_LANGUAGES.map((language) => (
                <LanguageRow
                    key={language.code}
                    language={language}
                    selected={language.code === selectedCode}
                    onPress={onSelect}
                />
            ))}
        </View>
    );
}
