// nativeApp\src\i18n\direction.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { isRunningInExpoGo, reloadAppAsync } from "expo";
import { I18nManager, Platform, type ViewStyle } from "react-native";

import { getAppLanguage, type AppLanguage } from "./languages";

// React Native reads the layout direction once at startup, so flipping it needs a restart.
// Expo Go resets RTL every time it opens a project, so restarting there would just loop.
const canRestart = Platform.OS !== "web" && !isRunningInExpoGo();

/** True when `code` reads in the other direction than the layout the app is running with. */
export const needsDirectionChange = (code: AppLanguage) =>
    canRestart && getAppLanguage(code).rtl !== I18nManager.isRTL;

/** Switches the native layout direction to match `code` and restarts the app to apply it. */
export async function applyDirection(code: AppLanguage) {
    const { rtl } = getAppLanguage(code);
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    try {
        await reloadAppAsync(`Layout direction changed for ${code}`);
    } catch {
        // can't restart: the new direction applies the next time the app opens
    }
}

const LAUNCH_RESTART_KEY = "filernow-direction-restart";

/**
 * On launch the native layout may not match the saved language: first launch on an Urdu phone
 * with English chosen, an RTL setting reset by the OS, or a restart that got interrupted.
 */
export async function matchDirectionOnLaunch(code: AppLanguage) {
    if (!needsDirectionChange(code)) return;
    // if we restarted moments ago and the direction still doesn't match, don't loop: open as is
    const last = Number(await AsyncStorage.getItem(LAUNCH_RESTART_KEY));
    if (Date.now() - last < 15_000) return;
    await AsyncStorage.setItem(LAUNCH_RESTART_KEY, String(Date.now()));
    await applyDirection(code);
}

/**
 * Mirrors arrow-like icons (back chevrons, "go" chevrons) in right-to-left layouts.
 * Constant per run: the direction only changes across a restart.
 */
export const flipInRTL: ViewStyle | undefined = I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined;
