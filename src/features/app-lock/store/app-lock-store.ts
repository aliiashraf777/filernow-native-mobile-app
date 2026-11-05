// nativeApp\src\features\app-lock\store\app-lock-store.ts

import { create } from "zustand";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useAppStore } from "@/stores/app-store";

type AppLockState = {
    /** Only shown when signed in with App Lock on (see AppLockGate). */
    locked: boolean;
    lock: () => void;
    unlock: () => void;
};

// In memory on purpose: every cold start begins locked.
export const useAppLockStore = create<AppLockState>()((set) => ({
    locked: true,
    lock: () => set({ locked: true }),
    unlock: () => set({ locked: false }),
}));

// Logging in or turning App Lock on is done by the person holding the phone right now, so don't
// lock them out straight after. Hydration (restoring saved state on launch) doesn't count.
useAuthStore.subscribe((state, prev) => {
    if (useAuthStore.persist.hasHydrated() && state.phone && !prev.phone) useAppLockStore.getState().unlock();
});
useAppStore.subscribe((state, prev) => {
    if (useAppStore.persist.hasHydrated() && state.appLock && !prev.appLock) useAppLockStore.getState().unlock();
});
