// nativeApp\src\lib\toast.ts

import { createContext, useContext } from "react";
import { toast } from "sonner-native";

export { toast, Toaster } from "sonner-native";

/** Toaster rendered inside BottomSheet: a native Modal covers the root Toaster on Android. */
export const SHEET_TOASTER = "sheet";

const ToasterIdContext = createContext<string | undefined>(undefined);
export const ToasterIdProvider = ToasterIdContext.Provider;

type Options = { description?: string };

/** Toasts that show on the nearest visible Toaster (inside a sheet, or the app root). */
export function useToast() {
    const toasterId = useContext(ToasterIdContext);
    return {
        success: (message: string, options?: Options) => toast.success(message, { ...options, toasterId }),
        error: (message: string, options?: Options) => toast.error(message, { ...options, toasterId }),
    };
}
