// nativeApp\src\features\biometric\lib\offer-biometric-login.ts

import { Alert } from "react-native";

import i18n from "@/i18n";
import { toast } from "@/lib/toast";

import { useBiometricStore } from "../store/biometric-store";
import { methodLabel } from "./biometric-service";

/**
 * After a PIN login: offer to turn on biometric login if the device supports it and it isn't
 * already on for this account. Resolves once the user has answered.
 */
export async function offerBiometricLogin(phone: string) {
    const store = useBiometricStore.getState();
    await store.load();
    const { support, enrolledPhone } = useBiometricStore.getState();
    if (!support?.available || enrolledPhone === phone) return;

    const t = i18n.getFixedT(null, "auth", "biometric");
    const method = methodLabel(support.method);

    const accepted = await new Promise<boolean>((resolve) =>
        Alert.alert(
            t("offerTitle", { method }),
            t("offerMessage", { method }),
            [
                { text: t("notNow"), style: "cancel", onPress: () => resolve(false) },
                { text: t("turnOn"), onPress: () => resolve(true) },
            ],
            { cancelable: true, onDismiss: () => resolve(false) },
        ),
    );
    if (!accepted) return;

    const result = await store.enable(phone);
    if (result.success) toast.success(t("turnedOn", { method }));
    else if (!result.cancelled) toast.error(result.message);
}
