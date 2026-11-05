// nativeApp\src\i18n\resources.ts

import enCommon from "./locales/en/common.json";
import enOnboarding from "./locales/en/onboarding.json";
import enLanguage from "./locales/en/language.json";
import enAuth from "./locales/en/auth.json";
import enMore from "./locales/en/more.json";
import enHome from "./locales/en/home.json";
import enKhata from "./locales/en/khata.json";
import enParty from "./locales/en/party.json";
import enBusiness from "./locales/en/business.json";
import enNotifications from "./locales/en/notifications.json";
import urCommon from "./locales/ur/common.json";
import urOnboarding from "./locales/ur/onboarding.json";
import urLanguage from "./locales/ur/language.json";
import urAuth from "./locales/ur/auth.json";
import urMore from "./locales/ur/more.json";
import urHome from "./locales/ur/home.json";
import urKhata from "./locales/ur/khata.json";
import urParty from "./locales/ur/party.json";
import urBusiness from "./locales/ur/business.json";
import urNotifications from "./locales/ur/notifications.json";
import urLatnCommon from "./locales/ur-Latn/common.json";
import urLatnOnboarding from "./locales/ur-Latn/onboarding.json";
import urLatnLanguage from "./locales/ur-Latn/language.json";
import urLatnAuth from "./locales/ur-Latn/auth.json";
import urLatnMore from "./locales/ur-Latn/more.json";
import urLatnHome from "./locales/ur-Latn/home.json";
import urLatnKhata from "./locales/ur-Latn/khata.json";
import urLatnParty from "./locales/ur-Latn/party.json";
import urLatnBusiness from "./locales/ur-Latn/business.json";
import urLatnNotifications from "./locales/ur-Latn/notifications.json";

import type { AppLanguage } from "./languages";

// English is the source of truth: its keys type `t()`, and every other language must have the same shape.
const en = {
    common: enCommon,
    onboarding: enOnboarding,
    language: enLanguage,
    auth: enAuth,
    more: enMore,
    home: enHome,
    khata: enKhata,
    party: enParty,
    business: enBusiness,
    notifications: enNotifications,
};

export type Resources = typeof en;

export const NAMESPACES = Object.keys(en) as (keyof Resources)[];

export const resources: Record<AppLanguage, Resources> = {
    en,
    ur: {
        common: urCommon,
        onboarding: urOnboarding,
        language: urLanguage,
        auth: urAuth,
        more: urMore,
        home: urHome,
        khata: urKhata,
        party: urParty,
        business: urBusiness,
        notifications: urNotifications,
    },
    "ur-Latn": {
        common: urLatnCommon,
        onboarding: urLatnOnboarding,
        language: urLatnLanguage,
        auth: urLatnAuth,
        more: urLatnMore,
        home: urLatnHome,
        khata: urLatnKhata,
        party: urLatnParty,
        business: urLatnBusiness,
        notifications: urLatnNotifications,
    },
};
