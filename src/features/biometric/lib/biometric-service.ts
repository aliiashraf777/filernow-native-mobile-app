// nativeApp\src\features\biometric\lib\biometric-service.ts

import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

import i18n from "@/i18n";

/** Keys under auth:biometric.method: the name the platform uses for the sensor. */
export type BiometricMethod = "touchId" | "faceId" | "fingerprint" | "faceUnlock" | "faceOrTouchId";
/** Keys under auth:biometric.unavailable. */
export type UnavailableReason = "web" | "noHardware" | "notEnrolled" | "weakOnly" | "checkFailed";

export type BiometricSupport = {
    /** Hardware present and a fingerprint/face enrolled on the device. */
    available: boolean;
    kind: "fingerprint" | "face" | "none";
    method: BiometricMethod;
    /** Why it can't be used. Only set when `available` is false. */
    unavailableReason?: UnavailableReason;
};

export type BiometricResult = { success: true } | { success: false; cancelled: boolean; message: string };

const METHODS = {
    ios: { fingerprint: "touchId", face: "faceId" },
    android: { fingerprint: "fingerprint", face: "faceUnlock" },
} as const;

const unavailable = (unavailableReason: UnavailableReason): BiometricSupport => ({
    available: false,
    kind: "none",
    method: Platform.OS === "ios" ? "faceOrTouchId" : "fingerprint",
    unavailableReason,
});

// errors where the user just backed out; show nothing and let them use the PIN
const CANCELLED = new Set<LocalAuthentication.LocalAuthenticationError>([
    "user_cancel",
    "system_cancel",
    "app_cancel",
    "user_fallback",
]);

export const methodLabel = (method: BiometricMethod) => i18n.t(`auth:biometric.method.${method}`);

export async function getBiometricSupport(): Promise<BiometricSupport> {
    if (Platform.OS !== "ios" && Platform.OS !== "android") return unavailable("web");
    try {
        const [hasHardware, isEnrolled, level, types] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
            LocalAuthentication.getEnrolledLevelAsync(),
            LocalAuthentication.supportedAuthenticationTypesAsync(),
        ]);
        if (!hasHardware) return unavailable("noHardware");
        if (!isEnrolled) return unavailable("notEnrolled");
        // Android: only Class 3 (strong) sensors; many face unlocks are weak and can be fooled by a photo.
        if (Platform.OS === "android" && level !== LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
            return unavailable("weakOnly");
        }

        const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        const hasFinger = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
        // iPhones have one or the other; on Android prefer the fingerprint when both exist
        const kind = Platform.OS === "ios" ? (hasFace ? "face" : "fingerprint") : hasFinger || !hasFace ? "fingerprint" : "face";
        return { available: true, kind, method: METHODS[Platform.OS][kind] };
    } catch {
        return unavailable("checkFailed");
    }
}

/** Shows the system biometric prompt. The device passcode fallback is off: our PIN is the fallback. */
export async function authenticate(promptMessage: string): Promise<BiometricResult> {
    const fail = (key: "lockout" | "failed" | "unavailable") => ({
        success: false as const,
        cancelled: false,
        message: i18n.t(`auth:biometric.error.${key}`),
    });

    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            cancelLabel: i18n.t("auth:biometric.usePin"),
            fallbackLabel: "",
            disableDeviceFallback: true,
            biometricsSecurityLevel: "strong",
        });
        if (result.success) return { success: true };
        if (CANCELLED.has(result.error)) return { success: false, cancelled: true, message: "" };
        return fail(result.error === "lockout" ? "lockout" : "failed");
    } catch {
        return fail("unavailable");
    }
}
