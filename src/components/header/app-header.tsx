// nativeApp\src\components\header\app-header.tsx

import { router } from "expo-router";
import { Bell, Crown, LayoutGrid } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BusinessSwitcher } from "@/features/business/components/business-switcher";
import { NotificationsSheet } from "@/features/notifications/components/notifications-sheet";
import { useUnreadCount } from "@/features/notifications/store/notifications-store";
import { colors } from "@/theme/tokens";

import { HeaderIconButton } from "./header-icon-button";

type Props = {
    onPremiumPress?: () => void;
};

/** Top bar shared by the tab screens: active business switcher, premium, notifications sheet, "More" page. */
export function AppHeader({ onPremiumPress }: Props) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const unread = useUnreadCount();
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <View className="border-b border-border-clr bg-page-bg" style={{ paddingTop: insets.top }}>
            <View className="h-14 flex-row items-center px-brand">
                {/* Left: active business */}
                <View className="flex-1 items-start">
                    <BusinessSwitcher />
                </View>

                {/* Center: wordmark */}
                {/* <Text
                    accessibilityRole="header"
                    className="font-wordmark text-text-dark"
                    style={{ fontSize: 26, lineHeight: 32, letterSpacing: -0.5 }}>
                    Filernow
                </Text> */}

                {/* Right: premium / notifications / apps */}
                <View className="flex-1 flex-row items-center justify-end gap-1">
                    <HeaderIconButton
                        icon={Crown}
                        label={t("header.premium")}
                        color={colors["accent-gold"]}
                        filled
                        size={34}
                        onPress={onPremiumPress}
                    />
                    <HeaderIconButton
                        icon={Bell}
                        label={unread > 0 ? t("header.notificationsUnread", { count: unread }) : t("header.notifications")}
                        filled
                        size={34}
                        badge={unread > 0}
                        onPress={() => setNotificationsOpen(true)}
                    />
                    <HeaderIconButton icon={LayoutGrid} label={t("header.more")} filled size={34} onPress={() => router.push("/more")} />
                </View>
            </View>

            <NotificationsSheet visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </View>
    );
}
