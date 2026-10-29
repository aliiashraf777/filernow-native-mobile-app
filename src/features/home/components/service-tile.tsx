// nativeApp\src\features\home\components\service-tile.tsx

import { Image } from "expo-image";
import { Pressable, Text } from "react-native";

import { serviceIcons } from "@/constants/service-icons";
import { cn } from "@/lib/cn";
import type { ServiceItem } from "@/features/home/data/services";

type Props = {
    item: ServiceItem;
    onPress: () => void;
    /** "boxed" draws a soft grey rounded tile; "plain" leaves the cell open (grid lines frame it). */
    variant?: "boxed" | "plain";
};

/** Illustrated icon over a label — one cell of a service grid. */
export function ServiceTile({ item, onPress, variant = "boxed" }: Props) {
    const boxed = variant === "boxed";

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            className={cn(
                "items-center justify-center active:opacity-70",
                boxed
                    ? "gap-brand-8 rounded-brand-12 border border-[#EAE6E5]x border-border-clr/25 bg-[#F5F3F2]x bg-card-bg-clr px-1.5 py-3"
                    : "gap-2 px-1 py-3"
            )}
        >
            <Image
                source={serviceIcons[item.icon]}
                contentFit="contain"
                style={boxed ? { width: 40, height: 40 } : { width: 40, height: 40 }}
            />
            <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className={boxed ? "font-jakarta text-para-small text-[#2B2B2B]" : "font-jakarta-medium text-para-small text-text-dark"}
            >
                {item.label}
            </Text>
        </Pressable>
    );
}
