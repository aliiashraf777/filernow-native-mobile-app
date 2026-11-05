// nativeApp\src\i18n\index.ts

import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { useAppStore } from "@/stores/app-store";

import { matchDirectionOnLaunch } from "./direction";
import { APP_LANGUAGES, DEFAULT_LANGUAGE, type AppLanguage } from "./languages";
import { NAMESPACES, resources } from "./resources";

// The app's own instance (registered with react-i18next for useTranslation / Trans)
const i18n = createInstance();

i18n.use(initReactI18next).init({
    resources,
    lng: useAppStore.getState().language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: APP_LANGUAGES.map((language) => language.code),
    // "ur-Latn" must fall back to English, never to "ur" (Urdu script mixed into Roman Urdu)
    load: "currentOnly",
    ns: NAMESPACES,
    defaultNS: "common",
    // translations are bundled, so init is synchronous and the first render is already translated
    initAsync: false,
    interpolation: { escapeValue: false }, // React already escapes
    returnEmptyString: false,
});

// The app store owns the chosen language (persisted); i18next just follows it,
// including when the saved value arrives during hydration on launch.
const follow = (code: AppLanguage) => {
    if (i18n.language !== code) i18n.changeLanguage(code);
};
useAppStore.subscribe((state) => follow(state.language));

if (useAppStore.persist.hasHydrated()) matchDirectionOnLaunch(useAppStore.getState().language);
else useAppStore.persist.onFinishHydration((state) => matchDirectionOnLaunch(state.language));

export default i18n;
