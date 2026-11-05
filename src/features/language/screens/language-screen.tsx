// nativeApp\src\features\language\screens\language-screen.tsx

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { images } from "@/constants/images";
import { LanguageList } from "@/features/language/components/language-list";
import { switchLanguage } from "@/features/language/lib/switch-language";
import { flipInRTL, needsDirectionChange } from "@/i18n/direction";
import type { AppLanguage } from "@/i18n/languages";
import { useAppStore } from "@/stores/app-store";
import { colors } from "@/theme/tokens";

/** Onboarding: pick the app language, then continue to the phone number screen. */
export default function LanguageScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(["language", "common"]);

    const storedLanguage = useAppStore((s) => s.language);
    const completeOnboarding = useAppStore((s) => s.completeOnboarding);
    const [selectedCode, setSelectedCode] = useState<AppLanguage>(storedLanguage);
    const [saving, setSaving] = useState(false);

    const onContinue = async () => {
        setSaving(true);
        completeOnboarding();
        // Urdu ↔ LTR restarts the app; the launch route then sends an onboarded user to /register
        const restarts = needsDirectionChange(selectedCode);
        await switchLanguage(selectedCode);
        if (!restarts) router.replace("/register");
    };

    return (
        // top only: the white card runs to the bottom edge and handles the bottom inset itself
        <SafeAreaView edges={["top"]} className="flex-1">
            <StatusBar style="light" />
            <Image
                source={images.welcomeBg}
                contentFit="cover"
                accessibilityLabel={t("backgroundA11y")}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />

            <View className="flex-row items-center justify-between px-6 pb-5 pt-2">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("common:actions.back")}
                    onPress={() => router.back()}
                    className="h-10 w-10 items-start justify-center">
                    <View style={flipInRTL}>
                        <SymbolView
                            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
                            tintColor={colors["text-dark"]}
                            size={22}
                        />
                    </View>
                </Pressable>
                <Text className="font-jakarta-bold text-xl text-primary">Filernow</Text>
            </View>

            <View className="flex-1 items-center justify-center px-8">
                <Image
                    source={images.languageGlobe}
                    contentFit="contain"
                    accessibilityLabel={t("globeA11y")}
                    style={{ width: "90%", height: "90%" }}
                />
            </View>

            <View className="mt-auto">
                {/* floating globe badge, half on the card */}
                <View className="z-10 -mb-8 ms-6 h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary">
                    <SymbolView
                        name={{ ios: "globe", android: "language", web: "language" }}
                        tintColor="#FFFFFF"
                        size={28}
                    />
                </View>

                <View
                    style={{ paddingBottom: insets.bottom + 16 }}
                    className="rounded-t-brand-32 bg-white px-6 pt-12">
                    <Text className="font-jakarta-extrabold text-[25px] text-text-dark">
                        <Trans
                            t={t}
                            i18nKey="screenTitle"
                            components={{ highlight: <Text className="text-primary" /> }}
                        />
                    </Text>
                    <Text className="mt-1 font-jakarta-medium text-sm text-text-secondary">{t("screenSubtitle")}</Text>

                    <LanguageList selectedCode={selectedCode} onSelect={setSelectedCode} className="mt-5" />

                    <PrimaryButton
                        label={t("common:actions.continue")}
                        className="mt-5"
                        disabled={saving}
                        onPress={onContinue}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
