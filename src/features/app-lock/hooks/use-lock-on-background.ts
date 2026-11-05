// nativeApp\src\features\app-lock\hooks\use-lock-on-background.ts

import { useEffect } from "react";
import { AppState } from "react-native";

import { useAppLockStore } from "../store/app-lock-store";

// Short trips out (file picker, share sheet, copying an OTP) shouldn't ask for the PIN again.
const LOCK_AFTER_MS = 30_000;

/** Locks the app when it comes back after being in the background for a while. */
export function useLockOnBackground() {
    useEffect(() => {
        let backgroundedAt: number | null = null;

        const subscription = AppState.addEventListener("change", (next) => {
            if (next === "background") {
                backgroundedAt = Date.now();
            } else if (next === "active" && backgroundedAt !== null) {
                if (Date.now() - backgroundedAt >= LOCK_AFTER_MS) useAppLockStore.getState().lock();
                backgroundedAt = null;
            }
        });
        return () => subscription.remove();
    }, []);
}
