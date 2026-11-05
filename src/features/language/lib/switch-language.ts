// nativeApp\src\features\language\lib\switch-language.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

import { applyDirection, needsDirectionChange } from "@/i18n/direction";
import type { AppLanguage } from "@/i18n/languages";
import { APP_STORE_KEY, useAppStore } from "@/stores/app-store";

/**
 * Saves the language (i18next follows the store) and, when it reads in the other direction,
 * restarts the app so the whole layout flips.
 */
export async function switchLanguage(code: AppLanguage) {
    useAppStore.getState().setLanguage(code);
    if (!needsDirectionChange(code)) return;

    // The store saves in the background. AsyncStorage handles requests in order, so this read
    // only resolves after that write has landed: the restart won't lose the new language.
    await AsyncStorage.getItem(APP_STORE_KEY);
    await applyDirection(code);
}
