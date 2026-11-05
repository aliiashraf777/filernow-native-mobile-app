// nativeApp\src\features\auth\components\register-screen.tsx

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Lock } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { checkPhone } from "../lib/mock-auth";
import { formatPhone, isValidPhone } from "../lib/phone";

// texts live in auth:register.chips / rotatingWords; every language has 3 rotating words
const WORD_COUNT = 3;
const WORD_H = 46;

/** Fade + slide-up entrance. Runs once when the screen appears. */
function Reveal({
  children,
  delay = 0,
  distance = 18,
  duration = 650,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay, duration]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function RegisterScreen({
  onContinue,
}: {
  onContinue: (phone: string, exists: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["auth", "common"]);
  const words = t("register.rotatingWords", { returnObjects: true });
  const chips = t("register.chips", { returnObjects: true });
  const [phone, setPhone] = useState(""); // digits only, without 0 / +92
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Rotating word: slides up out of a masked line, the next one slides up in
  const [wordIdx, setWordIdx] = useState(0);
  const [wordOpacity] = useState(() => new Animated.Value(1));
  const [wordY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const cycle = () => {
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 0, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(wordY, { toValue: -WORD_H, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (!finished || cancelled) return;
        setWordIdx((i) => (i + 1) % WORD_COUNT);
        wordY.setValue(WORD_H);
        Animated.parallel([
          Animated.timing(wordOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(wordY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      });
    };

    // respect the system "reduce motion" setting
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      timer = setInterval(cycle, 3200);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [wordOpacity, wordY]);

  const onChange = (text: string) => {
    // keep digits only, drop a leading 0 (0300... -> 300...), max 10 digits
    setPhone(text.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10));
    setRequestError(null);
  };

  const valid = isValidPhone(phone);
  const showError = touched && phone.length > 0 && !valid;

  const handleContinue = async () => {
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    try {
      // existing number -> login with PIN, new number -> create a PIN
      const { exists } = await checkPhone(phone);
      onContinue(phone, exists);
    } catch {
      setRequestError(t("register.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = showError || requestError
    ? "border-red-500 bg-red-50/40"
    : focused
      ? "border-[#D3222C] bg-white"
      : "border-gray-200 bg-gray-50";

  return (
    <View className="flex-1 bg-[#FBE9EA]">
      <StatusBar style="light" />

      {/* Background image (full screen, under the status bar too) */}
      <Image
        source={require("../../../../assets/images/Welcome-Frame.png")}
        contentFit="cover"
        contentPosition="top"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top: brand + headline (the background image shows through) */}
            <View className="flex-1 justify-between px-6 pb-7 pt-4" style={{ minHeight: 220 }}>
              <Image
                source={require("../../../../assets/images/FILERNOW.COM LOGO-01.svg")}
                contentFit="contain"
                accessibilityLabel="Filernow"
                style={{ width: 88, height: 88, marginLeft: -4 }}
              />

              <View>
                <Reveal delay={100}>
                  <Text className="font-jakarta-bold text-[36px] leading-[44px] tracking-[-1px] text-[#151A23]">
                    {t("register.headline")}
                  </Text>
                </Reveal>

                <Reveal delay={260}>
                  <View style={{ height: WORD_H, overflow: "hidden" }}>
                    <Animated.View style={{ opacity: wordOpacity, transform: [{ translateY: wordY }] }}>
                      <Text className="font-jakarta-bold text-[36px] leading-[44px] tracking-[-1px] text-[#D3222C]">
                        {words[wordIdx]}
                      </Text>
                    </Animated.View>
                  </View>
                </Reveal>

                <View className="mt-4 flex-row gap-2">
                  {chips.map((c, i) => (
                    <Reveal key={c} delay={620 + i * 120} distance={12} duration={500}>
                      <View className="rounded-full border border-[#F3D3D6] bg-white/85 px-3.5 py-[7px]">
                        <Text className="font-jakarta-bold text-xs text-[#463C40]">{c}</Text>
                      </View>
                    </Reveal>
                  ))}
                </View>
              </View>
            </View>

            {/* Bottom sheet */}
            <View
              className="rounded-t-[32px] bg-white px-6 pt-7 shadow-2xl shadow-[#64163C]/20"
              style={{ paddingBottom: Math.max(insets.bottom, 12) + 16 }}
            >
              <Text className="font-jakarta-bold text-[20px] leading-[38px] tracking-[-0.5px] text-[#151A23]">
                {t("register.title")}
              </Text>
              <Text className="mt-1.5 font-jakarta-medium text-[15px] leading-[22px] text-gray-500">
                {t("register.subtitle")}
              </Text>

              {/* Phone field */}
              <Text className="mb-2 mt-6 font-jakarta-bold text-[13px] text-[#151A23]">{t("register.phoneLabel")}</Text>
              {/* phone numbers read left to right in Urdu too: keep +92 before the digits */}
              <View
                className={`h-14 flex-row items-center rounded-2xl border-[1.5px] px-4 ${fieldClass}`}
                style={{ direction: "ltr" }}
              >
                <Text className="font-jakarta-bold text-base text-[#151A23]">+92</Text>
                <View className="mx-3 h-6 w-px bg-gray-200" />
                <TextInput
                  className="h-full flex-1 py-0 font-jakarta-medium text-base text-[#151A23]"
                  value={formatPhone(phone)}
                  onChangeText={onChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => {
                    setFocused(false);
                    setTouched(true);
                  }}
                  placeholder="300 1234567"
                  textAlign="left"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  selectionColor="#D3222C"
                  accessibilityLabel={t("register.phoneLabel")}
                />
              </View>

              {showError ? (
                <Text className="mt-3 font-jakarta-medium text-[13px] text-red-500">
                  {t("register.invalidPhone")}
                </Text>
              ) : requestError ? (
                <Text className="mt-3 font-jakarta-medium text-[13px] text-red-500">{requestError}</Text>
              ) : (
                <View className="mt-3 flex-row items-center gap-1.5">
                  <Lock size={13} color="#9CA3AF" strokeWidth={2} />
                  <Text className="font-jakarta-medium text-[13px] text-gray-500">
                    {t("register.privacyNote")}
                  </Text>
                </View>
              )}

              {/* Continue */}
              <Pressable
                onPress={handleContinue}
                disabled={!valid || loading}
                accessibilityRole="button"
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
                // shadow-* sets CSS variables: keep it on both states so NativeWind doesn't
                // "upgrade" (remount) the Pressable after the first render, which crashes on native
                className={`mt-5 h-14 items-center justify-center rounded-full shadow-lg ${
                  valid ? "bg-[#D3222C] shadow-[#D3222C]/30" : "bg-[#D3222C]/40 shadow-transparent"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-jakarta-bold text-base text-white">{t("common:actions.continue")}</Text>
                )}
              </Pressable>

              <Text className="mt-4 text-center font-jakarta-medium text-xs leading-[18px] text-gray-500">
                <Trans
                  t={t}
                  i18nKey="register.terms"
                  components={{ bold: <Text className="font-jakarta-bold text-[#151A23]" /> }}
                />
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}