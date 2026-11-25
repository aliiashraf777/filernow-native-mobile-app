// nativeApp\src\features\khata\components\blinking-dot.tsx

import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, View } from "react-native";

import { cn } from "@/lib/cn";

type Props = {
    /** Colour classes, e.g. "bg-warning". */
    className: string;
    /** One full fade-out-and-in cycle, in ms. Shorter = more urgent. */
    period?: number;
};

/** A small status dot that gently blinks to draw the eye. Decorative: the label beside it carries the meaning. */
export function BlinkingDot({ className, period = 1200 }: Props) {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let loop: Animated.CompositeAnimation | undefined;
        let cancelled = false;

        AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
            if (cancelled || reduce) return; // respect the "reduce motion" setting
            loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 0.2, duration: period / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ]),
            );
            loop.start();
        });

        return () => {
            cancelled = true;
            loop?.stop();
            opacity.setValue(1);
        };
    }, [opacity, period]);

    // className goes on a plain View inside, so it works whatever NativeWind does with Animated components
    return (
        <Animated.View style={{ opacity }}>
            <View className={cn("h-2.5 w-2.5 rounded-full", className)} />
        </Animated.View>
    );
}