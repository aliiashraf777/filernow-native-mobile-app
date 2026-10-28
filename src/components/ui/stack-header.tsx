// nativeApp\src\components\ui\stack-header.tsx

import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

type Props = {
    route: { name: string };
    back?: unknown;
    options: {
        title?: string;
        headerRight?: (props: { tintColor?: string; canGoBack: boolean }) => ReactNode;
    };
};

/** Header for stacks nested inside a tab. The tab header already handles the status-bar inset, so this adds none. */
export function StackHeader({ route, back, options }: Props) {
    const router = useRouter();
    const showBack = route.name !== "index" && (Boolean(back) || router.canGoBack());

    return (
        <View className="h-14 flex-row items-center border-b border-border-clr bg-white px-2">
            {showBack ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    onPress={() => router.back()}
                    hitSlop={8}
                    className="h-11 w-11 items-center justify-center">
                    <SymbolView
                        name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
                        size={22}
                        tintColor={colors["text-dark"]}
                    />
                </Pressable>
            ) : (
                <View className="w-2" />
            )}
            <Text numberOfLines={1} className="flex-1 font-jakarta-bold text-base text-text-dark">
                {options.title ?? route.name}
            </Text>
            <View className="min-w-[44px] flex-row items-center justify-end pr-2">
                {options.headerRight?.({ tintColor: colors["text-dark"], canGoBack: showBack })}
            </View>
        </View>
    );
}