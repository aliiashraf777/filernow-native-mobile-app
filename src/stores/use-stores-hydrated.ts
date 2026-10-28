// nativeApp\src\stores\use-stores-hydrated.ts

import { useEffect, useState } from "react";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useBusinessStore } from "@/features/business/store/business-store";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { useNotificationsStore } from "@/features/notifications/store/notifications-store";
import { useAppStore } from "@/stores/app-store";

const isReady = () =>
    useKhataStore.persist.hasHydrated() &&
    useAppStore.persist.hasHydrated() &&
    useAuthStore.persist.hasHydrated() &&
    useBusinessStore.persist.hasHydrated();
    // useNotificationsStore.persist.hasHydrated();

export function useStoresHydrated() {
    const [ready, setReady] = useState(isReady);

    useEffect(() => {
        const check = () => setReady(isReady());
        const offs = [
            useKhataStore.persist.onFinishHydration(check),
            useAppStore.persist.onFinishHydration(check),
            useAuthStore.persist.onFinishHydration(check),
            useBusinessStore.persist.onFinishHydration(check),
            // useNotificationsStore.persist.onFinishHydration(check),
        ];
        check();
        return () => offs.forEach((off) => off());
    }, []);

    return ready;
}