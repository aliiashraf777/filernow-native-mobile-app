// nativeApp\src\features\biometric\components\biometric-toggle-row.tsx

import { FingerprintPattern, ScanFace } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useToast } from "@/lib/toast";

import { useBiometric } from "../hooks/use-biometric";
import { useBiometricStore } from "../store/biometric-store";

type Props = { phone: string | null; className?: string };

/** "Fingerprint login" on/off. Dimmed with the reason when the device can't use it. */
export function BiometricToggleRow({ phone, className = "" }: Props) {
    const { t } = useTranslation("auth", { keyPrefix: "biometric" });
    const biometric = useBiometric(phone);
    const method = biometric.label;
    const enable = useBiometricStore((s) => s.enable);
    const disable = useBiometricStore((s) => s.disable);
    const [busy, setBusy] = useState(false);
    const toast = useToast();

    if (!phone) return null;
    const Icon = biometric.kind === "face" ? ScanFace : FingerprintPattern;
    const blocked = biometric.ready && !biometric.available;

    const toggle = async (on: boolean) => {
        if (busy || !biometric.ready) return;
        if (!biometric.available) {
            toast.error(t("notAvailable", { method }), { description: biometric.unavailableReason });
            return;
        }
        setBusy(true);
        try {
            if (!on) {
                await disable();
                toast.success(t("turnedOff", { method }), { description: t("turnedOffDescription") });
                return;
            }
            const result = await enable(phone);
            if (result.success) {
                toast.success(t("turnedOn", { method }), {
                    description: t("turnedOnDescription", { method }),
                });
            } else if (!result.cancelled) {
                toast.error(result.message);
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <View
            className={`flex-row items-center gap-4 rounded-brand-24 border border-[#ECE7E5] bg-[#F7F5F4] p-4 ${className}`}>
            <View
                className={`h-12 w-12 items-center justify-center rounded-brand-16 ${blocked ? "bg-[#EEEAE8]" : "bg-[#FDECEE]"}`}>
                <Icon size={26} color={blocked ? "#A39C9E" : "#D3222C"} strokeWidth={1.8} />
            </View>
            <View className="flex-1">
                <Text className="font-jakarta-semibold text-text-dark" style={{ fontSize: 16 }}>
                    {t("rowTitle", { method })}
                </Text>
                <Text
                    className={`mt-0.5 font-jakarta text-para-small ${blocked ? "text-[#B4535A]" : "text-[#8A8285]"}`}>
                    {blocked ? biometric.unavailableReason : t("rowSubtitle")}
                </Text>
            </View>
            <View style={{ opacity: blocked || !biometric.ready ? 0.45 : 1 }}>
                <ToggleSwitch
                    value={biometric.enabled}
                    onValueChange={toggle}
                    accessibilityLabel={t("rowTitle", { method })}
                />
            </View>
        </View>
    );
}
