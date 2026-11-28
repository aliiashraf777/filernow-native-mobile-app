import { ArrowDownLeft, ArrowUpRight, ChevronRight, HandCoins } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { EntryKind } from "@/features/khata/types/types";
import { cn } from "@/lib/cn";

const OPTIONS = [
    { kind: "income", icon: ArrowDownLeft, iconStyle: "bg-success-bg", iconColor: "text-success" },
    { kind: "expense", icon: ArrowUpRight, iconStyle: "bg-danger-bg", iconColor: "text-danger" },
    { kind: "debt", icon: HandCoins, iconStyle: "bg-warning-bg", iconColor: "text-warning" },
] as const;

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelect: (kind: EntryKind) => void;
};

export function AddEntrySheet({ visible, onClose, onSelect }: Props) {
    const { t } = useTranslation("khata");

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("addEntry.title")} subtitle={t("addEntry.subtitle")}>
            <View className="gap-2">
                {OPTIONS.map(({ kind, icon: Icon, iconStyle, iconColor }) => (
                    <Pressable
                        key={kind}
                        accessibilityRole="button"
                        onPress={() => onSelect(kind)}
                        className="min-h-[68px] flex-row items-center gap-3 rounded-brand-12 border border-border-clr bg-white p-3 active:bg-page-bg">
                        <View className={cn("h-10 w-10 items-center justify-center rounded-brand-12", iconStyle)}>
                            <Icon size={19} className={iconColor} strokeWidth={2.2} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-jakarta-bold text-sm text-text-dark">{t(`daily.add.${kind}`)}</Text>
                            <Text className="mt-0.5 font-jakarta text-xs leading-4 text-text-secondary-muted">
                                {t(`addEntry.${kind}Hint`)}
                            </Text>
                        </View>
                        <ChevronRight size={17} className="text-text-secondary-muter" />
                    </Pressable>
                ))}
            </View>
        </BottomSheet>
    );
}
