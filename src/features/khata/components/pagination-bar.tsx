// nativeApp\src\features\khata\components\pagination-bar.tsx

import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/cn";

type Props = { page: number; pageSize: number; total: number; onChange: (page: number) => void };

export function PaginationBar({ page, pageSize, total, onChange }: Props) {
    const { t } = useTranslation("khata", { keyPrefix: "pagination" });
    const pages = Math.max(1, Math.ceil(total / pageSize));
    if (total <= pageSize) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const Btn = ({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) => (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            className={cn("min-h-10 justify-center rounded-brand-8 border border-border-clr bg-white px-4 active:bg-page-bg", disabled && "opacity-40")}>
            <Text className="font-jakarta-semibold text-xs text-text-secondary">{label}</Text>
        </Pressable>
    );

    return (
        <View className="items-center gap-2 border-t border-border-clr bg-white px-4 py-3">
            <Text className="font-jakarta text-xs text-text-secondary-muted">{t("showing", { from, to, total })}</Text>
            <View className="flex-row items-center gap-3">
                <Btn label={t("prev")} disabled={page <= 1} onPress={() => onChange(page - 1)} />
                <Text className="font-jakarta-semibold text-xs text-text-dark">{t("page", { page, pages })}</Text>
                <Btn label={t("next")} disabled={page >= pages} onPress={() => onChange(page + 1)} />
            </View>
        </View>
    );
}