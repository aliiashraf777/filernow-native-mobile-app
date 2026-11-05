// nativeApp\src\features\home\hooks\use-open-service.ts

import { router, type Href } from "expo-router";
import { useTranslation } from "react-i18next";

import { toast } from "@/lib/toast";

/** Opens a service's route, or tells the user it isn't ready yet. `name` is already translated. */
export function useOpenService() {
    const { t } = useTranslation();
    return (name: string, href?: Href) => {
        if (href) router.push(href);
        else toast(t("serviceComingSoon", { name }));
    };
}
