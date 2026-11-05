// nativeApp\src\features\welcome\screens\welcome-screen.tsx

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { PaginationDots } from "@/features/welcome/components/pagination-dots";
import { SlideCaption } from "@/features/welcome/components/slide-caption";
import { SLIDES } from "@/features/welcome/data/slides";
import { useAutoCarousel } from "@/features/welcome/hooks/use-auto-carousel";

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation("onboarding");
    const { listRef, scrollX, width, onScroll, onScrollBeginDrag, onMomentumScrollEnd } =
        useAutoCarousel(SLIDES.length);

    return (
        <View className="flex-1 bg-primary-soft">
            <StatusBar style="light" />

            {/* auto-scrolling full-screen banners; kept LTR (images only) so the paging math holds in Urdu */}
            <View className="absolute inset-0" style={{ direction: "ltr" }}>
                <FlatList
                    ref={listRef}
                    data={SLIDES}
                    horizontal
                    pagingEnabled
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(slide) => slide.key}
                    getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={onScrollBeginDrag}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    style={{ flex: 1 }}
                    renderItem={({ item }) => (
                        <Image
                            source={item.image}
                            contentFit="cover"
                            contentPosition="top"
                            style={{ width, height: "100%" }}
                        />
                    )}
                />
            </View>

            {/* bottom sheet */}
            <View
                className="absolute inset-x-0 bottom-0 rounded-t-brand-32 bg-white px-6 pt-[22px] shadow-2xl shadow-primary-deep"
                style={{ paddingBottom: Math.max(insets.bottom, 12) + 12 }}>
                <View className="h-32">
                    {SLIDES.map((slide, i) => (
                        <SlideCaption key={slide.key} slide={slide} index={i} scrollX={scrollX} width={width} />
                    ))}
                </View>

                <PaginationDots count={SLIDES.length} scrollX={scrollX} width={width} />

                <PrimaryButton
                    label={t("getStarted")}
                    align="start"
                    // onPress={() => router.push("/register")}
                    onPress={() => router.push("/language")}
                />

                <Pressable
                    accessibilityRole="button"
                    // same phone screen: a registered number goes to the login PIN
                    onPress={() => router.push("/register")}
                    className="items-center pt-3.5"
                >
                    <Text className="font-jakarta-medium text-sm text-text-secondary">
                        {t("haveAccount")}{" "}
                        <Text className="font-jakarta-bold text-primary">{t("logIn")}</Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}