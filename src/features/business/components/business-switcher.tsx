// nativeApp\src\features\business\components\business-switcher.tsx

import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

import { businessName } from "@/features/business/lib/business-name";
import { useActiveBusiness } from "@/features/business/store/business-store";

import { BusinessIcon } from "./business-icon";
import { type BusinessSheetMode, BusinessSwitcherSheet } from "./business-switcher-sheet";

/** Header pill showing the active business; tapping it opens the Switch / Add Business sheet. */
export function BusinessSwitcher() {
    const { t } = useTranslation("business");
    const business = useActiveBusiness();
    const name = businessName(business);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<BusinessSheetMode>("switch");

    const openSheet = () => {
        setMode("switch");
        setOpen(true);
    };

    return (
        <>
            <Pressable
                onPress={openSheet}
                accessibilityRole="button"
                accessibilityLabel={t("currentA11y", { name })}
                hitSlop={6}
                className="h-9 max-w-full flex-row items-center gap-1.5 rounded-full border border-[#EAE3E1] bg-[#F5F1F0] pl-2 pr-2.5 active:opacity-70">
                <BusinessIcon type={business.type} size={22} />
                <Text
                    numberOfLines={1}
                    className="shrink font-jakarta-medium text-para-small text-[#2B2B2B]"
                    style={{ maxWidth: 110 }}>
                    {name}
                </Text>
                <ChevronDown size={14} color="#3A3A3A" strokeWidth={2.6} />
            </Pressable>

            <BusinessSwitcherSheet visible={open} mode={mode} onModeChange={setMode} onClose={() => setOpen(false)} />
        </>
    );
}
