// nativeApp\src\i18n\languages.ts

import { getLocales } from "expo-localization";

/** Every language the app ships translations for. Order = order in the language picker. */
export const APP_LANGUAGES = [
    { code: "en", name: "English", nativeName: "English", badge: "EN", rtl: false },
    { code: "ur", name: "Urdu", nativeName: "اردو", badge: "اُر", rtl: true },
    // BCP 47 "Urdu in Latin script": i18next and Intl understand it, unlike a made-up code
    { code: "ur-Latn", name: "Roman Urdu", nativeName: "Roman Urdu", badge: "UR", rtl: false },
] as const;

export type AppLanguageConfig = (typeof APP_LANGUAGES)[number];
export type AppLanguage = AppLanguageConfig["code"];

export const DEFAULT_LANGUAGE: AppLanguage = "en";

export const isAppLanguage = (value: unknown): value is AppLanguage =>
    APP_LANGUAGES.some((language) => language.code === value);

export const getAppLanguage = (code: AppLanguage): AppLanguageConfig =>
    APP_LANGUAGES.find((language) => language.code === code) ?? APP_LANGUAGES[0];

/** First-launch guess from the phone's settings: Urdu phones start in Urdu, everyone else in English. */
export function getDeviceLanguage(): AppLanguage {
    const locale = getLocales()[0];
    if (locale?.languageCode !== "ur") return DEFAULT_LANGUAGE;
    return locale.languageScriptCode === "Latn" ? "ur-Latn" : "ur";
}
