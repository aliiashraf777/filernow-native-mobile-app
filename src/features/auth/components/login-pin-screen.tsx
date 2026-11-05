// nativeApp\src\features\auth\components\login-pin-screen.tsx

import { FingerprintPattern, LockKeyhole, ScanFace, Smartphone } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

import { useBiometric } from "@/features/biometric/hooks/use-biometric";

import { usePinEntry } from "../hooks/use-pin-entry";
import { verifyPin } from "../lib/mock-auth";
import { maskPhone } from "../lib/phone";
import { PinDots } from "./pin-dots";
import { PinKeypad } from "./pin-keypad";
import { PinScreenLayout } from "./pin-screen-layout";

const MAX_ATTEMPTS = 5;

type Props = {
  phone: string;
  /** Top-left back button; omitted on the App Lock screen. */
  onBack?: () => void;
  /** The "Change" link next to the number. */
  onChangeNumber: () => void;
  onSuccess: () => void;
  onForgotPin?: () => void;
};

/** Login for a registered number (and the App Lock screen): enter the existing PIN or use biometrics. */
export default function LoginPinScreen({ phone, onBack, onChangeNumber, onSuccess, onForgotPin }: Props) {
  const { t } = useTranslation("auth");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const locked = attemptsLeft === 0;
  const disabled = loading || done || locked;

  const entry = usePinEntry({
    disabled,
    onComplete: async (pin, { fail }) => {
      setLoading(true);
      try {
        if (await verifyPin(phone, pin)) {
          setDone(true);
          onSuccess();
          return;
        }
        const left = attemptsLeft - 1;
        setAttemptsLeft(left);
        fail(
          left === 0
            ? t("pin.tooManyAttempts")
            : t("pin.incorrect", { count: left }),
        );
      } catch {
        fail(t("pin.verifyFailed"));
      } finally {
        setLoading(false);
      }
    },
  });

  const biometric = useBiometric(phone);
  const autoPrompted = useRef(false);

  const loginWithBiometric = async () => {
    if (disabled) return;
    const result = await biometric.authenticate(t("biometric.loginPrompt"));
    if (result.success) {
      setDone(true);
      onSuccess();
    } else if (!result.cancelled) {
      entry.fail(result.message);
    }
  };

  // open the biometric prompt once on arrival; cancelling it leaves the PIN pad
  useEffect(() => {
    if (!biometric.enabled || autoPrompted.current) return;
    autoPrompted.current = true;
    loginWithBiometric();
    // loginWithBiometric only reads state that is fixed before the first prompt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometric.enabled]);

  return (
    <PinScreenLayout
      icon={LockKeyhole}
      title={t("pin.loginTitle")}
      subtitle={
        biometric.enabled
          ? t("pin.loginSubtitleBiometric", { method: biometric.label })
          : t("pin.loginSubtitle")
      }
      onBack={onBack}
      keypad={
        <PinKeypad
          onKey={entry.press}
          onClear={entry.clear}
          disabled={disabled}
          biometric={
            biometric.enabled
              ? {
                  icon: biometric.kind === "face" ? ScanFace : FingerprintPattern,
                  label: t("biometric.loginButton", { method: biometric.label }),
                  onPress: loginWithBiometric,
                }
              : undefined
          }
        />
      }
    >
      <Pressable
        onPress={onChangeNumber}
        accessibilityRole="button"
        accessibilityLabel={t("pin.changeNumberA11y")}
        className="mt-4 flex-row items-center gap-2 rounded-full border border-[#F3D3D6] bg-white/85 py-2 pl-3 pr-3.5 active:opacity-80"
      >
        <Smartphone size={14} color="#D3222C" strokeWidth={2.2} />
        <Text className="font-jakarta-bold text-[13px] text-[#151A23]" style={{ writingDirection: "ltr" }}>
          {maskPhone(phone)}
        </Text>
        <Text className="font-jakarta-bold text-[13px] text-[#D3222C]">{t("pin.changeNumber")}</Text>
      </Pressable>

      <PinDots
        length={entry.length}
        filled={entry.pin.length}
        error={entry.error}
        shake={entry.shake}
        loading={loading}
        success={done ? t("pin.loggedIn") : null}
      />

      <Pressable onPress={onForgotPin} accessibilityRole="button" hitSlop={10} className="mt-1 active:opacity-70">
        <Text className="font-jakarta-bold text-sm text-[#D3222C]">{t("pin.forgot")}</Text>
      </Pressable>
    </PinScreenLayout>
  );
}
