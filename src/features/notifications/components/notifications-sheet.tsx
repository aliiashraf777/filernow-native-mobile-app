// nativeApp\src\features\notifications\components\notifications-sheet.tsx

import { BellOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { GradientFill, PRIMARY_GRADIENT } from "@/components/ui/gradient-fill";
import { SheetSectionLabel } from "@/components/ui/sheet-section-label";
import type { INotification } from "@/features/notifications/data/notifications";
import { isToday } from "@/features/notifications/lib/time-ago";
import { useNotificationsStore, useUnreadCount } from "@/features/notifications/store/notifications-store";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

import { NotificationCard } from "./notification-card";

type Filter = "all" | "unread" | "alerts";

// labels: notifications:filters.<key>
const FILTERS: Filter[] = ["all", "unread", "alerts"];

const matches = (n: INotification, f: Filter) => f === "all" || (f === "unread" ? !n.read : n.kind === "alert");

function FilterChip({ label, active, count, onPress }: { label: string; active: boolean; count?: number; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className="rounded-full active:opacity-80"
            style={
                active
                    ? {
                          backgroundColor: colors.primary,
                          shadowColor: colors.primary,
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 4,
                      }
                    : undefined
            }>
            <View
                className={cn(
                    "h-11 flex-row items-center gap-2 overflow-hidden rounded-full px-5",
                    !active && "bg-[#F3F1F0]",
                )}>
                {active ? <GradientFill colors={PRIMARY_GRADIENT} direction="horizontal" /> : null}
                <Text
                    className={cn("text-para-18", active ? "font-jakarta-semibold text-white" : "font-jakarta text-[#5F5A5C]")}>
                    {label}
                </Text>
                {count ? (
                    <View
                        className={cn(
                            "h-6 min-w-[24px] items-center justify-center rounded-full px-1.5",
                            active ? "bg-white" : "bg-primary",
                        )}>
                        <Text className={cn("font-jakarta-bold text-[12px]", active ? "text-primary" : "text-white")}>
                            {count}
                        </Text>
                    </View>
                ) : null}
            </View>
        </Pressable>
    );
}

type Props = { visible: boolean; onClose: () => void };

/** Notifications list with All / Unread / Alerts filters, grouped into Today and Earlier. */
export function NotificationsSheet({ visible, onClose }: Props) {
    const { t } = useTranslation("notifications");
    const items = useNotificationsStore((s) => s.items);
    const markRead = useNotificationsStore((s) => s.markRead);
    const markAllRead = useNotificationsStore((s) => s.markAllRead);
    const unread = useUnreadCount();
    const [filter, setFilter] = useState<Filter>("all");

    const shown = items
        .filter((n) => matches(n, filter))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const groups = [
        { title: t("today"), data: shown.filter((n) => isToday(n.createdAt)) },
        { title: t("earlier"), data: shown.filter((n) => !isToday(n.createdAt)) },
    ].filter((g) => g.data.length > 0);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title={t("title")}
            subtitle={t("subtitle")}
            headerAction={
                <Pressable
                    onPress={markAllRead}
                    disabled={unread === 0}
                    accessibilityRole="button"
                    hitSlop={8}
                    className={cn("mt-1 active:opacity-70", unread === 0 && "opacity-40")}>
                    <Text className="font-jakarta-semibold text-para-18 text-primary">{t("markAllRead")}</Text>
                </Pressable>
            }>
            <View className="mb-4 flex-row gap-2.5" accessibilityRole="tablist">
                {FILTERS.map((f) => (
                    <FilterChip
                        key={f}
                        label={t(`filters.${f}`)}
                        active={filter === f}
                        count={f === "all" ? unread : undefined}
                        onPress={() => setFilter(f)}
                    />
                ))}
            </View>

            {groups.length === 0 ? (
                <View className="items-center py-12">
                    <BellOff size={32} color="#B5ADB0" strokeWidth={1.8} />
                    <Text className="mt-3 font-jakarta-medium text-para-base text-[#8A8285]">
                        {filter === "unread" ? t("caughtUp") : t("empty")}
                    </Text>
                </View>
            ) : (
                groups.map((g, i) => (
                    <View key={g.title} className={cn(i > 0 && "mt-5")}>
                        <SheetSectionLabel>{g.title}</SheetSectionLabel>
                        <View className="gap-3">
                            {g.data.map((n) => (
                                <NotificationCard key={n.id} item={n} onPress={markRead} />
                            ))}
                        </View>
                    </View>
                ))
            )}
        </BottomSheet>
    );
}
