// nativeApp\src\app\(tabs)\tax-advisor.tsx

import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";

export default function TaxAdvisor() {
    const { t } = useTranslation();
    return <PlaceholderScreen title={t("tabs.taxAdvisor")} />;
}
