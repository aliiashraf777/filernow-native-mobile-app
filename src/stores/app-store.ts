// nativeApp\src\stores\app-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_LANGUAGE, getDeviceLanguage, isAppLanguage, type AppLanguage } from "@/i18n/languages";

type AppState = {
    hasOnboarded: boolean;
    /** UI language. Change it through useChangeLanguage(), which also handles the RTL restart. */
    language: AppLanguage;
    /** Ask for the PIN when the app opens (toggled from the Quick Menu). */
    appLock: boolean;
    /** Show a persistent notification for adding an entry quickly (More → Settings). */
    quickNotification: boolean;
    setLanguage: (code: AppLanguage) => void;
    completeOnboarding: () => void;
    setAppLock: (on: boolean) => void;
    setQuickNotification: (on: boolean) => void;
};

export const APP_STORE_KEY = "filernow-app";

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            hasOnboarded: false,
            language: getDeviceLanguage(),
            appLock: true,
            quickNotification: false,
            setLanguage: (language) => set({ language }),
            completeOnboarding: () => set({ hasOnboarded: true }),
            setAppLock: (appLock) => set({ appLock }),
            setQuickNotification: (quickNotification) => set({ quickNotification }),
        }),
        {
            name: APP_STORE_KEY,
            version: 2,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({
                hasOnboarded: s.hasOnboarded,
                language: s.language,
                appLock: s.appLock,
                quickNotification: s.quickNotification,
            }),
            // v1 allowed any ISO 639-1 code; keep it only if we actually ship that language
            migrate: (persisted, version) => {
                const state = persisted as Partial<AppState>;
                if (version < 2 && !isAppLanguage(state.language)) state.language = DEFAULT_LANGUAGE;
                return state as AppState;
            },
        },
    ),
);
