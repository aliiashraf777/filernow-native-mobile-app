// nativeApp\src\features\welcome\components\slide-caption.tsx

import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Animated, Text, View } from "react-native";

import { SLIDE_ICONS, type Slide } from "@/features/welcome/data/slides";
import { colors } from "@/theme/tokens";

type Props = { slide: Slide; index: number; scrollX: Animated.Value; width: number };

/** Caption that cross-fades and slides in sync with its banner. */
export function SlideCaption({ slide, index, scrollX, width }: Props) {
    const { t } = useTranslation("onboarding");
    const at = (offset: number) => (index + offset) * width;

    const opacity = scrollX.interpolate({
        inputRange: [at(-0.6), at(0), at(0.6)],
        outputRange: [0, 1, 0],
        extrapolate: "clamp",
    });
    const translateX = scrollX.interpolate({
        inputRange: [at(-1), at(0), at(1)],
        outputRange: [24, 0, -24],
        extrapolate: "clamp",
    });

    return (
        <Animated.View
            pointerEvents="none"
            style={{ position: "absolute", left: 0, right: 0, top: 0, opacity, transform: [{ translateX }] }}>
            <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-[14px] bg-primary-lighter">
                    <SymbolView name={SLIDE_ICONS[slide.icon]} size={24} tintColor={colors.primary} />
                </View>
                <Text className="flex-1 font-jakarta-extrabold text-[20px] leading-[26px] tracking-[-0.3px] text-text-dark">
                    {t(`slides.${slide.key}.title`)}
                </Text>
            </View>
            <Text className="mt-3 font-jakarta-medium text-[14px] leading-[21px] text-text-secondary">
                {t(`slides.${slide.key}.text`)}
            </Text>
        </Animated.View>
    );
}