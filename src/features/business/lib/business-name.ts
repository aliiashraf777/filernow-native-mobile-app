// nativeApp\src\features\business\lib\business-name.ts

import i18n from "@/i18n";

import { DEFAULT_BUSINESS_ID, type IBusiness, defaultBusinesses } from "../data/business-options";

/**
 * Name to show for a business. The built-in "My Expenses" follows the app language until the
 * user renames it; names the user typed are shown as typed.
 * Components using this call useTranslation() so they re-render when the language changes.
 */
export function businessName(business: Pick<IBusiness, "id" | "name">) {
    const seeded = defaultBusinesses.find((b) => b.id === DEFAULT_BUSINESS_ID)?.name;
    return business.id === DEFAULT_BUSINESS_ID && business.name === seeded
        ? i18n.t("business:myExpenses")
        : business.name;
}
