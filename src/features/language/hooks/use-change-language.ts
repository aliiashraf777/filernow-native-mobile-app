// nativeApp\src\features\language\hooks\use-change-language.ts

import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { needsDirectionChange } from "@/i18n/direction";
import { getAppLanguage, type AppLanguage } from "@/i18n/languages";
import { useToast } from "@/lib/toast";

import { switchLanguage } from "../lib/switch-language";

/**
 * Changes the app language. Switching between Urdu (right-to-left) and an LTR language needs a
 * restart, so that case asks first. Resolves to whether the language was changed.
 */
export function useChangeLanguage() {
    const { t } = useTranslation(["language", "common"]);
    const toast = useToast();

    return (code: AppLanguage) =>
        new Promise<boolean>((resolve) => {
            const target = getAppLanguage(code);

            if (!needsDirectionChange(code)) {
                switchLanguage(code).then(() => {
                    // i18n already follows the new language, so this toast shows in it
                    toast.success(t("changed", { language: target.nativeName }));
                    resolve(true);
                });
                return;
            }

            Alert.alert(
                t("restart.title"),
                t(target.rtl ? "restart.message" : "restart.messageLtr", { language: target.nativeName }),
                [
                    { text: t("common:actions.cancel"), style: "cancel", onPress: () => resolve(false) },
                    {
                        text: t("restart.confirm"),
                        onPress: () => switchLanguage(code).then(() => resolve(true)),
                    },
                ],
                { cancelable: true, onDismiss: () => resolve(false) },
            );
        });
}
