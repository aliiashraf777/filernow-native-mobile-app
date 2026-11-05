// nativeApp\src\features\more\screens\more-screen.tsx

import Constants from "expo-constants";
import { Image } from "expo-image";
import { Redirect, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { emIcons } from "@/constants/expense-manager-icons";
import { images } from "@/constants/images";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { currencyOf } from "@/features/business/data/business-options";
import { businessName } from "@/features/business/lib/business-name";
import { useActiveBusiness, useBusinessStore } from "@/features/business/store/business-store";
import { useOpenService } from "@/features/home/hooks/use-open-service";
import { LanguageSheet } from "@/features/language/components/language-sheet";
import { AppLockSheet } from "@/features/more/components/app-lock-sheet";
import { CurrencySheet } from "@/features/more/components/currency-sheet";
import { MoreCard, MoreDivider } from "@/features/more/components/more-card";
import { MoreRow } from "@/features/more/components/more-row";
import { MoreTile } from "@/features/more/components/more-tile";
import { SOCIAL_LINKS, type SocialLink } from "@/features/more/data/social-links";
import { flipInRTL } from "@/i18n/direction";
import { toast } from "@/lib/toast";
import { useAppStore } from "@/stores/app-store";
import { colors } from "@/theme/tokens";

const NAVY = "#13294B";
const HEADER_BG_HEIGHT = 280;

type Sheet = "language" | "currency" | "app-lock" | null;

/** "More" page (header Apps button): backup, shortcuts, settings, support, logout, socials. */
export default function MoreScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation(["more", "common", "auth"]);
    const openService = useOpenService();
    const isSignedIn = useAuthStore((s) => s.phone !== null);
    const logout = useLogout();
    const quickNotification = useAppStore((s) => s.quickNotification);
    const setQuickNotification = useAppStore((s) => s.setQuickNotification);
    const business = useActiveBusiness();
    const businessCount = useBusinessStore((s) => s.businesses.length);
    const deleteBusiness = useBusinessStore((s) => s.deleteBusiness);

    const [settingsOpen, setSettingsOpen] = useState(true);
    const [sheet, setSheet] = useState<Sheet>(null);
    const closeSheet = () => setSheet(null);

    if (!isSignedIn) return <Redirect href="/welcome" />;

    const soon = (name: string) => openService(name);

    const confirmDeleteBusiness = () => {
        if (businessCount <= 1) {
            toast.error(t("needOneBusiness"));
            return;
        }
        Alert.alert(t("deleteBusinessTitle", { name: businessName(business) }), t("deleteBusinessMessage"), [
            { text: t("common:actions.cancel"), style: "cancel" },
            {
                text: t("common:actions.delete"),
                style: "destructive",
                onPress: () => {
                    if (deleteBusiness(business.id)) toast.success(t("businessDeleted", { name: businessName(business) }));
                },
            },
        ]);
    };

    const confirmLogout = () =>
        Alert.alert(t("auth:logout.title"), t("auth:logout.message"), [
            { text: t("common:actions.cancel"), style: "cancel" },
            {
                text: t("common:actions.logOut"),
                style: "destructive",
                onPress: logout,
            },
        ]);

    const openSocial = (s: SocialLink) => {
        if (s.url) Linking.openURL(s.url).catch(() => toast.error(t("couldNotOpen", { name: s.label })));
        else soon(s.label);
    };

    return (
        <View className="flex-1 bg-[#F4F2F1]">
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
                <Image
                    source={images.moreHeaderBg}
                    contentFit="cover"
                    style={{ position: "absolute", top: 0, left: 0, right: 0, height: HEADER_BG_HEIGHT + insets.top }}
                />

                {/* Header */}
                <View className="flex-row items-center px-5 pb-6" style={{ paddingTop: insets.top + 24 }}>
                    <Pressable
                        onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
                        accessibilityRole="button"
                        accessibilityLabel={t("common:actions.back")}
                        hitSlop={10}
                        className="h-10 w-10 items-start justify-center active:opacity-60">
                        <ChevronLeft size={20} color={NAVY} strokeWidth={2.6} style={flipInRTL} />
                    </Pressable>
                    <Text accessibilityRole="header" className="font-jakarta-extrabold text-heading-h3" style={{ color: NAVY }}>
                        {t("title")}
                    </Text>
                </View>

                <View className="gap-4 px-4">
                    {/* Backup */}
                    <MoreCard>
                        <MoreRow
                            icon="backup"
                            tint="#E8F2FF"
                            label={t("backup")}
                            labelExtra={
                                <Text className="font-jakarta-medium text-[#16A34A]" style={{ fontSize: 14 }}>
                                    {t("backupSuccessful")}
                                </Text>
                            }
                            onPress={() => soon(t("backup"))}
                        />
                        {/* <View
                            className="flex-row items-center bg-[#FFF1EC]"
                            style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
                            <Image source={emIcons.googleDrive} contentFit="contain" style={{ width: 30, height: 30 }} />
                            <Text className="flex-1 font-jakarta text-para-small text-[#6E6669]">
                                We&apos;re excited to offer Google Drive backup! This feature helps you securely save your data.
                            </Text>
                        </View> */}
                    </MoreCard>

                    {/* Shortcuts */}
                    <View className="flex-row gap-3">
                        <MoreTile icon="expenseCard" label={t("expenseCard")} onPress={() => soon(t("expenseCard"))} />
                        <MoreTile icon="recycleBin" label={t("recycleBin")} onPress={() => soon(t("recycleBin"))} />
                        <MoreTile icon="calculator" label={t("calculator")} onPress={() => soon(t("calculator"))} />
                    </View>

                    {/* Settings */}
                    <MoreCard className="mt-8">
                        <MoreRow
                            icon="settings"
                            tint="#EFEAFF"
                            label={t("settings")}
                            onPress={() => setSettingsOpen((o) => !o)}
                            right={
                                <View style={{ transform: [{ rotate: settingsOpen ? "0deg" : "-90deg" }] }}>
                                    <ChevronDown size={22} color={colors.primary} strokeWidth={2.6} />
                                </View>
                            }
                        />
                        {settingsOpen ? (
                            <>
                                <MoreDivider />
                                <MoreRow
                                    nested
                                    icon="quickNotification"
                                    tint="#FFF4DC"
                                    label={t("quickNotification")}
                                    right={
                                        <ToggleSwitch
                                            value={quickNotification}
                                            onValueChange={setQuickNotification}
                                            accessibilityLabel={t("quickNotification")}
                                        />
                                    }
                                />
                                <MoreDivider />
                                <MoreRow
                                    nested
                                    icon="appLock"
                                    tint="#FFF4DC"
                                    label={t("appLock")}
                                    chevron="grey"
                                    onPress={() => setSheet("app-lock")}
                                />
                                <MoreDivider />
                                <MoreRow
                                    nested
                                    icon="language"
                                    tint="#E8F2FF"
                                    label={t("language")}
                                    chevron="grey"
                                    onPress={() => setSheet("language")}
                                />
                                <MoreDivider />
                                <MoreRow
                                    nested
                                    icon="businessCurrency"
                                    tint="#FFF4DC"
                                    label={t("businessCurrency")}
                                    labelExtra={
                                        <Text allowFontScaling={false} style={{ fontSize: 20 }}>
                                            {currencyOf(business.currency).flag}
                                        </Text>
                                    }
                                    chevron="grey"
                                    onPress={() => setSheet("currency")}
                                />
                                <MoreDivider />
                                <MoreRow
                                    nested
                                    icon="deleteBusiness"
                                    tint="#FFF4DC"
                                    label={t("deleteBusiness")}
                                    chevron="grey"
                                    onPress={confirmDeleteBusiness}
                                />
                                <MoreDivider />
                                <MoreRow
                                    nested
                                    icon="deleteAccount"
                                    tint="#EFEAFF"
                                    label={t("deleteAccount")}
                                    chevron="grey"
                                    onPress={() => soon(t("deleteAccount"))}
                                />
                            </>
                        ) : null}
                    </MoreCard>

                    {/* Support */}
                    <MoreCard>
                        <MoreRow icon="helpSupport" tint="#E3F6EE" label={t("helpSupport")} onPress={() => soon(t("helpSupport"))} />
                        <MoreDivider />
                        <MoreRow icon="aboutUs" tint="#E8F2FF" label={t("aboutUs")} onPress={() => soon(t("aboutUs"))} />
                        <MoreDivider />
                        <MoreRow icon="logout" tint="#FFE8EC" label={t("logout")} chevron="none" onPress={confirmLogout} />
                    </MoreCard>

                    {/* Socials */}
                    <View className="mt-4 flex-row items-center justify-center gap-6">
                        <Text className="font-jakarta-semibold text-text-dark" style={{ fontSize: 17 }}>
                            {t("followUs")}
                        </Text>
                        {SOCIAL_LINKS.map((s) => (
                            <Pressable
                                key={s.id}
                                onPress={() => openSocial(s)}
                                accessibilityRole="link"
                                accessibilityLabel={s.label}
                                hitSlop={6}
                                className="active:opacity-70">
                                <Image source={emIcons[s.icon]} contentFit="contain" style={{ width: 44, height: 44 }} />
                            </Pressable>
                        ))}
                    </View>

                    <Text className="text-center font-jakarta text-para-small text-[#A39B9E]">
                        {t("version", { version: Constants.expoConfig?.version ?? "1.0.0" })}
                    </Text>
                </View>
            </ScrollView>

            <LanguageSheet visible={sheet === "language"} onClose={closeSheet} />
            <CurrencySheet visible={sheet === "currency"} onClose={closeSheet} />
            <AppLockSheet visible={sheet === "app-lock"} onClose={closeSheet} />
        </View>
    );
}
