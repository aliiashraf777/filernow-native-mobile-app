// nativeApp\src\features\biometric\hooks\use-biometric.ts

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { authenticate } from "../lib/biometric-service";
import { useBiometricStore } from "../store/biometric-store";

/** Device support plus whether biometric login is turned on for `phone`, with translated labels. */
export function useBiometric(phone: string | null) {
    const { t } = useTranslation("auth");
    const support = useBiometricStore((s) => s.support);
    const enrolledPhone = useBiometricStore((s) => s.enrolledPhone);

    // re-check on every mount so a fingerprint added in phone settings shows up without a restart
    useEffect(() => {
        useBiometricStore.getState().refreshSupport();
    }, []);

    const available = support?.available ?? false;
    const reason = support?.unavailableReason;

    return {
        ready: support !== null,
        available,
        kind: support?.kind ?? "none",
        /** e.g. "Fingerprint", "Face ID", "فنگر پرنٹ". */
        label: t(`biometric.method.${support?.method ?? "fingerprint"}`),
        unavailableReason: reason ? t(`biometric.unavailable.${reason}`) : undefined,
        enabled: available && phone !== null && enrolledPhone === phone,
        authenticate,
    };
}
