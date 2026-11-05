// nativeApp\src\features\party\components\balance-overview.tsx

import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { pkr } from "@/features/khata/lib/debt";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

type Tone = "get" | "give" | "net";
const TONE: Record<Tone, { box: string; val: string }> = {
    get: { box: "border-danger/25 bg-danger-bg", val: "text-danger" },
    give: { box: "border-success/25 bg-success-bg", val: "text-success" },
    net: { box: "border-border-clr bg-white", val: "text-text-dark" },
};

function Tile({ label, value, sub, tone, className }: { label: string; value: string; sub: string; tone: Tone; className?: string }) {
    return (
        <View className={cn("rounded-brand-12 border p-3", TONE[tone].box, className)}>
            <Text className="font-jakarta-semibold text-[11px] uppercase tracking-wide text-text-secondary-muted">{label}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit className={cn("mt-0.5 font-jakarta-bold text-base", TONE[tone].val)}>
                {value}
            </Text>
            <Text className="font-jakarta text-[11px] text-text-secondary-muter">{sub}</Text>
        </View>
    );
}

type Props = {
    get: number;
    give: number;
    getCount: number;
    giveCount: number;
    hidden: boolean;
    onToggleHidden: () => void;
};

const EYE: SymbolViewProps["name"] = { ios: "eye", android: "visibility", web: "visibility" };
const EYE_OFF: SymbolViewProps["name"] = { ios: "eye.slash", android: "visibility_off", web: "visibility_off" };

export function BalanceOverview({ get, give, getCount, giveCount, hidden, onToggleHidden }: Props) {
    const { t } = useTranslation("party", { keyPrefix: "balance" });
    const net = get - give;
    const mask = (n: number) => (hidden ? "Rs ••••" : pkr(n));

    return (
        <View className="p-4">
            <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-jakarta-bold text-sm text-text-dark">{t("overview")}</Text>
                <Pressable accessibilityRole="button" onPress={onToggleHidden} hitSlop={8} className="flex-row items-center gap-1.5">
                    <SymbolView name={hidden ? EYE : EYE_OFF} size={14} tintColor={colors.primary} />
                    <Text className="font-jakarta-medium text-xs text-primary">
                        {hidden ? t("show") : t("hide")}
                    </Text>
                </Pressable>
            </View>
            <View className="flex-row gap-2">
                <Tile tone="get" label={t("youWillGet")} value={mask(get)} sub={t("fromParties", { count: getCount })} className="flex-1" />
                <Tile tone="give" label={t("youWillGive")} value={mask(give)} sub={t("toParties", { count: giveCount })} className="flex-1" />
            </View>
            <Tile
                tone="net"
                label={t("net")}
                value={mask(Math.abs(net))}
                sub={net > 0 ? t("netGet") : net < 0 ? t("netGive") : t("netSettled")}
                className="mt-2"
            />
        </View>
    );
}