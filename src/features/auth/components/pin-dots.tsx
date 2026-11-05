// nativeApp\src\features\auth\components\pin-dots.tsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, Text, View } from "react-native";

function PinDot({ filled, error }: { filled: boolean; error: boolean }) {
  const [scale] = useState(() => new Animated.Value(filled ? 1 : 0));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: filled ? 1 : 0,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [filled, scale]);

  return (
    <View
      className={`h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${
        error ? "border-red-500" : filled ? "border-[#D3222C]" : "border-[#CBD0D8]"
      }`}
    >
      <Animated.View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: error ? "#EF4444" : "#D3222C",
          opacity: scale,
          transform: [{ scale }],
        }}
      />
    </View>
  );
}

type Props = {
  length: number;
  filled: number;
  error: string | null;
  shake: Animated.Value;
  loading?: boolean;
  success?: string | null;
};

/** PIN progress dots with the status line underneath (error, loading or success). */
export function PinDots({ length, filled, error, shake, loading, success }: Props) {
  const { t } = useTranslation("auth");
  return (
    <View className="mt-8 items-center">
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <View className="flex-row gap-5" accessibilityLabel={t("pin.digitsEntered", { filled, length })}>
          {Array.from({ length }).map((_, index) => (
            <PinDot key={index} filled={index < filled} error={!!error} />
          ))}
        </View>
      </Animated.View>

      <View className="mt-5 h-6 items-center justify-center">
        {error ? (
          <Text className="text-center font-jakarta-medium text-[13px] text-red-500">{error}</Text>
        ) : loading ? (
          <ActivityIndicator color="#D3222C" />
        ) : success ? (
          <Text className="text-center font-jakarta-bold text-[13px] text-emerald-600">{success}</Text>
        ) : null}
      </View>
    </View>
  );
}
