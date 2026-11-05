// nativeApp\src\app\(tabs)\ask-ai.tsx

import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";

export default function AskAi() {
    const { t } = useTranslation();
    return <PlaceholderScreen title={t("tabs.askAi")} />;
}
