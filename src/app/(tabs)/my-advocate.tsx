// nativeApp\src\app\(tabs)\my-advocate.tsx

import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";

export default function MyAdvocate() {
    const { t } = useTranslation();
    return <PlaceholderScreen title={t("tabs.myAdvocate")} />;
}
