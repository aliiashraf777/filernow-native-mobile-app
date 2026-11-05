// nativeApp\src\features\auth\components\setup-pin-screen.tsx

import { ShieldCheck } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PIN_LENGTH, usePinEntry } from "../hooks/use-pin-entry";
import { createAccount } from "../lib/mock-auth";
import { PinDots } from "./pin-dots";
import { PinKeypad } from "./pin-keypad";
import { PinScreenLayout } from "./pin-screen-layout";

const isWeak = (pin: string) => {
  if (/^(\d)\1+$/.test(pin)) return true;
  const digits = pin.split("").map(Number);
  const ascending = digits.every((digit, index) => index === 0 || digit === digits[index - 1] + 1);
  const descending = digits.every((digit, index) => index === 0 || digit === digits[index - 1] - 1);
  return ascending || descending;
};

type Props = {
  phone: string;
  onBack?: () => void;
  onComplete: () => void;
};

/** Registration: create a PIN, then confirm it. */
export default function SetupPinScreen({ phone, onBack, onComplete }: Props) {
  const { t } = useTranslation("auth");
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const firstPin = useRef("");

  const entry = usePinEntry({
    disabled: loading || done,
    onComplete: async (pin, { fail, reset }) => {
      if (step === "create") {
        if (isWeak(pin)) return fail(t("pin.weak"));
        firstPin.current = pin;
        reset();
        setStep("confirm");
        return;
      }

      if (pin !== firstPin.current) return fail(t("pin.mismatch"));

      setLoading(true);
      try {
        await createAccount(phone, pin);
        setDone(true);
        onComplete();
      } catch {
        fail(t("pin.createFailed"));
      } finally {
        setLoading(false);
      }
    },
  });

  const goBack = () => {
    if (step === "create") return onBack?.();
    firstPin.current = "";
    entry.reset();
    setStep("create");
  };

  return (
    <PinScreenLayout
      icon={ShieldCheck}
      title={step === "create" ? t("pin.createTitle") : t("pin.confirmTitle")}
      subtitle={
        step === "create"
          ? t("pin.createSubtitle", { length: PIN_LENGTH })
          : t("pin.confirmSubtitle")
      }
      onBack={step === "confirm" || onBack ? goBack : undefined}
      top={
        <View className="mb-5 flex-row gap-1.5">
          <View className="h-1 w-8 rounded-full bg-[#D3222C]" />
          <View className={`h-1 w-8 rounded-full ${step === "confirm" ? "bg-[#D3222C]" : "bg-[#D5D9E0]"}`} />
        </View>
      }
      keypad={<PinKeypad onKey={entry.press} onClear={entry.clear} disabled={loading || done} />}
    >
      <PinDots
        length={entry.length}
        filled={entry.pin.length}
        error={entry.error}
        shake={entry.shake}
        loading={loading}
        success={done ? t("pin.accountReady") : null}
      />
    </PinScreenLayout>
  );
}
