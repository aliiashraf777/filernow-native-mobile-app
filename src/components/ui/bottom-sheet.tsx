// nativeApp\src\components\ui\bottom-sheet.tsx

import { X } from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { useSheetKeyboardLayout } from "@/hooks/use-sheet-keyboard-layout";
import { SHEET_TOASTER, Toaster, ToasterIdProvider } from "@/lib/toast";

const OPEN_MS = 300;
const CLOSE_MS = 220;
const DISMISS_DISTANCE = 110; // px dragged down before release closes the sheet
const DISMISS_VELOCITY = 900;
/** Every sheet opens at the same height (share of the screen) so they all feel consistent; content scrolls inside. */
const SHEET_HEIGHT_RATIO = 0.5;

type Props = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    /** Pinned under the scrolling content, e.g. a submit button. */
    footer?: ReactNode;
    /** Replaces the round "X" button at the top-right, e.g. a "Mark all read" link. */
    headerAction?: ReactNode;
    /** Hide the round "X" button in the header. */
    hideCloseButton?: boolean;
};

/**
 * App-wide bottom sheet: dimmed backdrop, slide-up animation, drag handle (drag down to dismiss),
 * title / subtitle / close header, scrollable body and an optional pinned footer.
 * Stays above the keyboard, so it is safe for forms.
 *
 * Controlled: flip `visible` to open/close; the exit animation plays before the modal unmounts.
 */
export function BottomSheet({ visible, onClose, title, subtitle, children, footer, headerAction, hideCloseButton }: Props) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const { onAreaLayout, resetBase, keyboardOpen, overlap, maxSheet } = useSheetKeyboardLayout();
    const [mounted, setMounted] = useState(visible);
    // Fixed height; only shrinks when the keyboard leaves less room.
    const sheetHeight = Math.min(maxSheet, Math.round(height * SHEET_HEIGHT_RATIO));

    const progress = useSharedValue(0); // 0 = hidden, 1 = open
    const drag = useSharedValue(0); // finger offset while dragging down

    // Mount as soon as we're asked to open; unmounting waits for the exit animation below.
    if (visible && !mounted) setMounted(true);

    useEffect(() => {
        if (visible) {
            drag.set(0);
            progress.set(withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) }));
        } else {
            resetBase();
            progress.set(
                withTiming(0, { duration: CLOSE_MS, easing: Easing.in(Easing.cubic) }, (finished) => {
                    if (finished) scheduleOnRN(setMounted, false);
                }),
            );
        }
    }, [visible, progress, drag, resetBase]);

    const pan = Gesture.Pan()
        .activeOffsetY(8)
        .onUpdate((e) => {
            drag.set(Math.max(0, e.translationY));
        })
        .onEnd((e) => {
            if (drag.get() > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
                scheduleOnRN(onClose);
            } else {
                drag.set(withSpring(0, { damping: 20, stiffness: 220 }));
            }
        });

    const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: drag.get() + (1 - progress.get()) * height }],
    }));

    return (
        <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: "flex-end" }} onLayout={onAreaLayout}>
                    <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                        <Pressable
                            accessibilityLabel={t("actions.close")}
                            onPress={onClose}
                            className="flex-1 bg-text-dark/50"
                        />
                    </Animated.View>

                    <Animated.View style={[{ height: sheetHeight, marginBottom: overlap }, sheetStyle]}>
                        <View
                            className="flex-1 rounded-t-brand-32 bg-white"
                            style={{ paddingBottom: keyboardOpen ? 12 : insets.bottom + 12 }}>
                            <GestureDetector gesture={pan}>
                                <View className="px-5 pt-3">
                                    <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-[#E4DEDF]" />

                                    {title || headerAction || !hideCloseButton ? (
                                        <View className="mb-4 flex-row items-start gap-3">
                                            <View className="flex-1">
                                                {title ? (
                                                    <Text
                                                        accessibilityRole="header"
                                                        className="font-jakarta-extrabold text-heading-h3 text-text-dark"
                                                        style={{ fontSize: 22 }}>
                                                        {title}
                                                    </Text>
                                                ) : null}
                                                {subtitle ? (
                                                    <Text className="mt-1 font-jakarta text-para-small text-[#8A8285]">
                                                        {subtitle}
                                                    </Text>
                                                ) : null}
                                            </View>
                                            {headerAction ?? (hideCloseButton ? null : (
                                                <Pressable
                                                    onPress={onClose}
                                                    accessibilityRole="button"
                                                    accessibilityLabel={t("actions.close")}
                                                    hitSlop={6}
                                                    className="h-11 w-11 items-center justify-center rounded-brand-12 bg-[#F3F1F0] active:opacity-70">
                                                    <X size={20} color="#3A3A3A" strokeWidth={2.2} />
                                                </Pressable>
                                            ))}
                                        </View>
                                    ) : null}
                                </View>
                            </GestureDetector>

                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerClassName="px-5 pb-2"
                                keyboardShouldPersistTaps="handled"
                                keyboardDismissMode="on-drag"
                                showsVerticalScrollIndicator={false}
                                bounces={false}>
                                <ToasterIdProvider value={SHEET_TOASTER}>{children}</ToasterIdProvider>
                            </ScrollView>

                            {footer ? <View className="px-5 pt-3">{footer}</View> : null}
                        </View>
                    </Animated.View>
                </View>
                <Toaster id={SHEET_TOASTER} fullWindowOverlay={false} />
            </GestureHandlerRootView>
        </Modal>
    );
}