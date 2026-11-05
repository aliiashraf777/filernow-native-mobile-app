// nativeApp\src\i18n\i18next.d.ts

import "i18next";

import type { Resources } from "./resources";

// Typed translation keys: t("auth:pin.forgot") is checked by tsc, typos fail the typecheck.
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: "common";
        resources: Resources;
    }
}
