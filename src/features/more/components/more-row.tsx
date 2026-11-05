// nativeApp\src\features\more\components\more-row.tsx

import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { type EmIconName, emIcons } from "@/constants/expense-manager-icons";
import { flipInRTL } from "@/i18n/direction";
import { colors } from "@/theme/tokens";

type Props = {
    icon: EmIconName;
    /** Background of the rounded icon tile. */
    tint: string;
    label: string;
    /** Extra content right after the label, e.g. "(Successful)" or a flag. */
    labelExtra?: ReactNode;
    onPress?: () => void;
    /** "red" for top-level rows, "grey" for nested settings rows, "none" to hide it. */
    chevron?: "red" | "grey" | "none";
    /** Replaces the chevron, e.g. a toggle switch. */
    right?: ReactNode;
    /** Nested rows (inside Settings) are indented with a smaller icon tile. */
    nested?: boolean;
};

/** One line on the More screen: tinted icon tile, label, chevron or a custom control. */
export function MoreRow({ icon, tint, label, labelExtra, onPress, chevron = "red", right, nested }: Props) {
    const tile = nested ? 40 : 44;

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={onPress ? "button" : undefined}
            accessibilityLabel={label}
            className="flex-row items-center active:bg-[#FAF7F7]"
            style={{
                minHeight: nested ? 60 : 66,
                paddingVertical: 10,
                paddingLeft: nested ? 44 : 20,
                paddingRight: 20,
                gap: 12,
            }}>
            <View
                className="items-center justify-center"
                style={{ width: tile, height: tile, borderRadius: nested ? 12 : 14, backgroundColor: tint }}>
                <Image source={emIcons[icon]} contentFit="contain" style={{ width: tile * 0.58, height: tile * 0.58 }} />
            </View>

            <View className="flex-1 flex-row items-center gap-2">
                <Text numberOfLines={1} className="shrink font-jakarta text-text-dark" style={{ fontSize: 15 }}>
                    {label}
                </Text>
                {labelExtra}
            </View>

            {right ??
                (chevron === "none" ? null : (
                    <ChevronRight
                        size={20}
                        color={chevron === "red" ? colors.primary : "#8A8285"}
                        strokeWidth={chevron === "red" ? 2.6 : 2.2}
                        style={flipInRTL}
                    />
                ))}
        </Pressable>
    );
}
