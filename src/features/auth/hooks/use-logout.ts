// nativeApp\src\features\auth\hooks\use-logout.ts

import { router } from "expo-router";

import { useAuthStore } from "../store/auth-store";

/** Signs out and starts over from the Welcome screen. */
export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);

  return () => {
    // drop stacked screens (e.g. More) so Back can't return into the signed-in app
    if (router.canDismiss()) router.dismissAll();
    router.replace("/welcome");
    signOut();
  };
}
