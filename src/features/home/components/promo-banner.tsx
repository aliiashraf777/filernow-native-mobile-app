// nativeApp\src\features\home\components\promo-banner.tsx

import { memo, useCallback, useEffect, useState } from "react";
import { useFocusEffect, type Href } from "expo-router";
import { Image, type ImageSource } from "expo-image";
import { PanResponder, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { images } from "@/constants/images";
import { useOpenService } from "@/features/home/hooks/use-open-service";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/*                              BANNER SLIDES                                 */
/*  Each slide is a full-bleed artwork; tapping it opens the slide's feature. */
/* -------------------------------------------------------------------------- */

type Slide = {
    id: string;
    title: string;
    image: ImageSource;
    href?: Href; // no href → "coming soon" toast
};

const BANNER_SLIDES: Slide[] = [
    { id: "expense-manager", title: "Expense Manager", image: images.bannerExpenseManager, href: "/khata/daily" },
    { id: "under-18", title: "Under 18", image: images.bannerUnder18, href: "/khata" },
    { id: "savings", title: "Savings", image: images.bannerSavings },
];

const IMAGE_ASPECT = 1530 / 534; // assets/images/banners/banner-* artwork size
const AUTOPLAY_MS = 4000;
const SWIPE_THRESHOLD = 40;
const FADE_IN_MS = 400;
const FADE_OUT_MS = 150;

/* -------------------------------------------------------------------------- */
/*                                 SLIDE                                      */
/* -------------------------------------------------------------------------- */

const BannerSlide = memo(function BannerSlide({
    slide,
    isActive,
    onPress,
}: {
    slide: Slide;
    isActive: boolean;
    onPress: (slide: Slide) => void;
}) {
    const opacity = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        opacity.value = withTiming(isActive ? 1 : 0, { duration: isActive ? FADE_IN_MS : FADE_OUT_MS });
    }, [isActive, opacity]);

    const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View
            style={fadeStyle}
            pointerEvents={isActive ? "auto" : "none"}
            accessibilityElementsHidden={!isActive}
            importantForAccessibility={isActive ? "auto" : "no-hide-descendants"}
            className={cn("absolute inset-0", isActive ? "z-10" : "z-0")}
        >
            <Pressable
                onPress={() => onPress(slide)}
                accessibilityRole="button"
                accessibilityLabel={slide.title}
                className="h-full w-full active:opacity-90"
            >
                <Image source={slide.image} contentFit="cover" style={{ width: "100%", height: "100%" }} />
            </Pressable>
        </Animated.View>
    );
});

/* -------------------------------------------------------------------------- */
/*                              PROMO BANNER                                  */
/* -------------------------------------------------------------------------- */

export function PromoBanner() {
    const openService = useOpenService();
    const [activeSlide, setActiveSlide] = useState(0);
    const [isTouching, setIsTouching] = useState(false);
    const [isFocused, setIsFocused] = useState(true);

    const hasMultipleSlides = BANNER_SLIDES.length > 1;

    const openSlide = useCallback((slide: Slide) => openService(slide.title, slide.href), [openService]);

    // Stop autoplay while the home tab is in the background.
    useFocusEffect(
        useCallback(() => {
            setIsFocused(true);
            return () => setIsFocused(false);
        }, [])
    );

    const showSlide = useCallback((index: number) => {
        setActiveSlide((index + BANNER_SLIDES.length) % BANNER_SLIDES.length);
    }, []);

    // Timeout keyed on activeSlide, so a manual swipe/tap restarts the countdown.
    useEffect(() => {
        if (isTouching || !isFocused || !hasMultipleSlides) return;

        const timer = setTimeout(() => showSlide(activeSlide + 1), AUTOPLAY_MS);
        return () => clearTimeout(timer);
    }, [activeSlide, isTouching, isFocused, hasMultipleSlides, showSlide]);

    // Horizontal swipe: left → next, right → previous. Vertical drags fall through to the ScrollView.
    // Created once, so it steps with a functional update instead of reading activeSlide.
    const [swipe] = useState(() =>
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
                hasMultipleSlides && Math.abs(g.dx) > 15 && Math.abs(g.dx) > Math.abs(g.dy),
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: (_, g) => {
                const step = g.dx <= -SWIPE_THRESHOLD || g.vx <= -0.5 ? 1 : g.dx >= SWIPE_THRESHOLD || g.vx >= 0.5 ? -1 : 0;
                if (step) setActiveSlide((current) => (current + step + BANNER_SLIDES.length) % BANNER_SLIDES.length);
            },
        })
    );

    return (
        <View
            {...swipe.panHandlers}
            accessibilityLabel="Featured services"
            style={{ aspectRatio: IMAGE_ASPECT }}
            className="mt-brand-8 w-full overflow-hidden rounded-brand-12 border border-border-clr/50 shadow-primary-light"
            onTouchStart={() => setIsTouching(true)}
            onTouchEnd={() => setIsTouching(false)}
            onTouchCancel={() => setIsTouching(false)}
        >
            {BANNER_SLIDES.map((slide, index) => (
                <BannerSlide key={slide.id} slide={slide} isActive={index === activeSlide} onPress={openSlide} />
            ))}

            {/* slide bottom buttons */}
            {hasMultipleSlides && (
                <View className="absolute bottom-1.5 z-20 w-full items-center" pointerEvents="box-none">
                    <View className="flex-row items-center gap-1 rounded-full bg-white/85 px-1.5 py-[3px]">
                        {BANNER_SLIDES.map((slide, index) => (
                            <Pressable
                                key={slide.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Show ${slide.title} banner`}
                                accessibilityState={{ selected: index === activeSlide }}
                                hitSlop={8}
                                onPress={() => showSlide(index)}
                                className={cn(
                                    "h-1.5 rounded-full",
                                    index === activeSlide ? "w-5 bg-primary" : "w-1.5 bg-primary/25"
                                )}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}
