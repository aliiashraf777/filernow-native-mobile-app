// nativeApp\src\features\more\components\app-lock-sheet.tsx

import { useTranslation } from "react-i18next";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AppLockToggleRow } from "@/features/app-lock/components/app-lock-toggle-row";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { BiometricToggleRow } from "@/features/biometric/components/biometric-toggle-row";

type Props = { visible: boolean; onClose: () => void };

/** App Lock on/off, plus biometric login when the device supports it. */
export function AppLockSheet({ visible, onClose }: Props) {
    const { t } = useTranslation("auth", { keyPrefix: "appLock" });
    const phone = useAuthStore((s) => s.phone);

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("title")} subtitle={t("subtitle")}>
            <AppLockToggleRow />
            <BiometricToggleRow phone={phone} className="mt-3" />
        </BottomSheet>
    );
}
