// nativeApp\src\features\language\components\language-sheet.tsx

import { useTranslation } from "react-i18next";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useAppStore } from "@/stores/app-store";

import { useChangeLanguage } from "../hooks/use-change-language";
import { LanguageList } from "./language-list";

type Props = { visible: boolean; onClose: () => void };

/** In-app language switcher (More → Settings → Language). Applies the choice right away. */
export function LanguageSheet({ visible, onClose }: Props) {
    const { t } = useTranslation("language");
    const language = useAppStore((s) => s.language);
    const changeLanguage = useChangeLanguage();

    const select = async (code: typeof language) => {
        if (code === language) return onClose();
        // close first so the confirm dialog (Urdu ↔ LTR restart) isn't stacked on the sheet
        onClose();
        await changeLanguage(code);
    };

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("sheetTitle")} subtitle={t("screenSubtitle")}>
            <LanguageList selectedCode={language} onSelect={select} />
        </BottomSheet>
    );
}
