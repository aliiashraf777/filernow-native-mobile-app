// nativeApp\src\components\ui\primary-button.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, type PressableProps, Text, View } from "react-native";

import { flipInRTL } from "@/i18n/direction";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const ARROW = { ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" } as const;

type Props = Omit<PressableProps, "children"> & {
    label: string;
    align?: "center" | "start";
    className?: string;
};

export function PrimaryButton({ label, align = "center", className, ...rest }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            className={cn(
                "min-h-14 flex-row items-center rounded-full bg-primary pl-6 pr-2 active:opacity-80",
                className,
            )}
            {...rest}>
            <Text
                className={cn(
                    "flex-1 font-jakarta-bold text-base text-white",
                    align === "center" ? "text-center" : "text-left",
                )}>
                {label}
            </Text>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white" style={flipInRTL}>
                <SymbolView name={ARROW} tintColor={colors.primary} size={18} />
            </View>
        </Pressable>
    );
}