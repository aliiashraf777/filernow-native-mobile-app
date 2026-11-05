// nativeApp\src\features\auth\components\pin-screen-layout.tsx

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, type LucideIcon } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Easing, Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { flipInRTL } from "@/i18n/direction";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onBack?: () => void;
  /** Shown above the icon, e.g. step progress. */
  top?: ReactNode;
  /** Shown under the heading: dots, status, links. */
  children: ReactNode;
  /** Content of the white bottom sheet. */
  keypad: ReactNode;
};

/** Shared shell for the PIN screens: background, back button, heading and keypad sheet. */
export function PinScreenLayout({ icon: Icon, title, subtitle, onBack, top, children, keypad }: Props) {
  const { t } = useTranslation("auth");
  const insets = useSafeAreaInsets();
  const compact = useWindowDimensions().height < 700;
  const [reveal] = useState(() => new Animated.Value(0));

  // replay the entrance whenever the heading changes (create -> confirm)
  useEffect(() => {
    reveal.setValue(0);
    Animated.timing(reveal, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [title, reveal]);

  return (
    <View className="flex-1 bg-[#FBE9EA]">
      <StatusBar style="light" />

      <Image
        source={require("../../../../assets/images/Welcome-Frame.png")}
        contentFit="cover"
        contentPosition="top"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="h-14 justify-center px-4">
          {onBack && (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t("pin.back")}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90 active:opacity-80"
            >
              <ChevronLeft size={22} color="#151A23" strokeWidth={2.2} style={flipInRTL} />
            </Pressable>
          )}
        </View>

        <View className="flex-1 items-center justify-center px-8">
          {top}

          {!compact && (
            <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md shadow-black/10">
              <Icon size={26} color="#D3222C" strokeWidth={2} />
            </View>
          )}

          <Animated.View
            style={{
              alignItems: "center",
              opacity: reveal,
              transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            }}
          >
            <Text className="text-center font-jakarta-extrabold text-[28px] leading-[36px] tracking-[-0.5px] text-[#151A23]">
              {title}
            </Text>
            <Text className="mt-2 text-center font-jakarta-medium text-[15px] leading-[22px] text-gray-600">
              {subtitle}
            </Text>
          </Animated.View>

          {children}
        </View>

        <View
          className="rounded-t-[32px] bg-white px-5 pt-3 shadow-2xl shadow-[#64163C]/20"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#E6E8EC]" />
          {keypad}
        </View>
      </SafeAreaView>
    </View>
  );
}
