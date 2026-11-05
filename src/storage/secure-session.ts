// nativeApp\src\storage\secure-session.ts

import * as SecureStore from "expo-secure-store";

// Keychain (iOS) / Keystore-encrypted prefs (Android). Never synced to iCloud or other devices.
const OPTIONS: SecureStore.SecureStoreOptions = {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/** The account (10-digit phone) that may log in with biometrics on this device. One per device. */
const BIOMETRIC_PHONE_KEY = "filernow.biometric.phone";

// TODO: when FastAPI is connected, store the refresh token here too and only release it after
// a successful biometric prompt, so a biometric login gets a real server session instead of
// just restoring the phone locally.

export async function getBiometricPhone() {
    try {
        return await SecureStore.getItemAsync(BIOMETRIC_PHONE_KEY, OPTIONS);
    } catch {
        // unavailable (web) or the keystore entry was invalidated, e.g. after a device restore
        return null;
    }
}

export async function setBiometricPhone(phone: string) {
    await SecureStore.setItemAsync(BIOMETRIC_PHONE_KEY, phone, OPTIONS);
}

export async function clearBiometricPhone() {
    try {
        await SecureStore.deleteItemAsync(BIOMETRIC_PHONE_KEY, OPTIONS);
    } catch {
        // nothing stored
    }
}
