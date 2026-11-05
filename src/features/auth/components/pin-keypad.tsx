// nativeApp\src\features\auth\components\pin-keypad.tsx

import { Delete, type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "back"],
];
const LINE = "border-[#F1E6E8]";

type Props = {
  onKey: (key: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  /** Fills the empty bottom-left key, e.g. a fingerprint button. */
  biometric?: { icon: LucideIcon; label: string; onPress: () => void };
};

/** Number pad laid out as a grid with dividers between the keys only. */
export function PinKeypad({ onKey, onClear, disabled, biometric }: Props) {
  const { t } = useTranslation("auth");
  const { height } = useWindowDimensions();
  const keySize = height < 700 ? 62 : 74;

  return (
    // dialer order (1 2 3 left to right) in Urdu too, like the phone's own number pad
    <View style={{ opacity: disabled ? 0.55 : 1, direction: "ltr" }}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} className={`flex-row ${rowIndex < ROWS.length - 1 ? `border-b ${LINE}` : ""}`}>
          {row.map((key, index) => {
            const divider = index < row.length - 1 ? `border-r ${LINE}` : "";

            if (key === "" && biometric) {
              const Icon = biometric.icon;
              return (
                <Pressable
                  key={index}
                  onPress={biometric.onPress}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={biometric.label}
                  className={`flex-1 items-center justify-center ${divider}`}
                  style={{ height: keySize }}
                >
                  {({ pressed }) => (
                    <View
                      className={`items-center justify-center rounded-2xl ${pressed ? "bg-[#FDECEE]" : ""}`}
                      style={{ width: keySize - 8, height: keySize - 12 }}
                    >
                      <Icon size={28} color="#D3222C" strokeWidth={1.8} />
                    </View>
                  )}
                </Pressable>
              );
            }

            if (key === "") return <View key={index} className={`flex-1 ${divider}`} style={{ height: keySize }} />;

            return (
              <Pressable
                key={index}
                onPress={() => onKey(key)}
                onLongPress={key === "back" ? onClear : undefined}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={key === "back" ? t("pin.delete") : key}
                className={`flex-1 items-center justify-center ${divider}`}
                style={{ height: keySize }}
              >
                {({ pressed }) => (
                  <View
                    className={`items-center justify-center rounded-2xl ${pressed ? "bg-[#FDECEE]" : ""}`}
                    style={{ width: keySize - 8, height: keySize - 12 }}
                  >
                    {key === "back" ? (
                      <Delete size={24} color={pressed ? "#D3222C" : "#5B6270"} strokeWidth={1.8} />
                    ) : (
                      <Text
                        className={`font-jakarta-bold text-[24px] leading-[30px] ${
                          pressed ? "text-[#D3222C]" : "text-[#151A23]"
                        }`}
                      >
                        {key}
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
