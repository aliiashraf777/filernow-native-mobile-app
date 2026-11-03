// nativeApp\src\features\khata\components\atm-card.tsx

import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

import { GradientFill } from "@/components/ui/gradient-fill";
import { pkr } from "@/features/khata/lib/debt";
import type { ICard } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

export const GRADIENTS: Record<ICard["gradient"], readonly [string, string]> = {
    primary: [colors.primary, "#A51B35"],
    secondary: [colors.secondary, colors["secondary-light"]],
    dark: ["#1F2937", "#111827"],
};
const GOLD: readonly [string, string] = ["#F5D98B", "#B8923A"];

const two = (n: number | undefined, placeholder: string) =>
    n === undefined || Number.isNaN(n) ? placeholder : String(n).padStart(2, "0");
export const expiry = (c: { expiryMonth?: number; expiryYear?: number }) => `${two(c.expiryMonth, "MM")}/${two(c.expiryYear, "YY")}`;

/** Every field except gradient is optional so the form can preview a half-filled card. */
export type AtmCardData = Partial<Pick<ICard, "label" | "balance" | "last4" | "expiryMonth" | "expiryYear">> & {
    gradient: ICard["gradient"];
};

export function AtmCard({ card, className }: { card: AtmCardData; className?: string }) {
    return (
        <View className={cn("w-full max-w-[355px] self-center overflow-hidden rounded-[14px]", className)} style={{ aspectRatio: 100 / 55 }}>
            <GradientFill colors={GRADIENTS[card.gradient]} />
            <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <View className="absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-black/10" />

            <View className="flex-1 justify-between p-4">
                <View className="flex-row items-start justify-between">
                    <Text numberOfLines={1} className="max-w-[70%] font-jakarta-semibold text-[13px] tracking-wide text-white">
                        {card.label?.trim() || "Bank Name"}
                    </Text>
                    <SymbolView
                        name={{ ios: "wifi", android: "wifi", web: "wifi" }}
                        size={18}
                        tintColor="rgba(255,255,255,0.8)"
                        style={{ transform: [{ rotate: "90deg" }] }}
                    />
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="h-[26px] w-[34px] overflow-hidden rounded-[5px]">
                        <GradientFill colors={GOLD} />
                    </View>
                    <View className="items-end">
                        <Text className="font-jakarta text-[9px] uppercase tracking-widest text-white/60">Balance</Text>
                        <Text className="font-jakarta-semibold text-[15px] text-white">{pkr(card.balance ?? 0)}</Text>
                    </View>
                </View>

                <Text className="font-jakarta-medium text-[15px] tracking-[3px] text-white/95">
                    •••• •••• •••• {card.last4 || "••••"}
                </Text>

                <View className="flex-row items-end justify-between">
                    <View>
                        <Text className="font-jakarta text-[8px] uppercase tracking-widest text-white/60">Valid thru</Text>
                        <Text className="font-jakarta-medium text-xs text-white">{expiry(card)}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="h-6 w-6 rounded-full bg-white/85" />
                        <View className="-ml-2.5 h-6 w-6 rounded-full bg-secondary-light/80" />
                    </View>
                </View>
            </View>
        </View>
    );
}