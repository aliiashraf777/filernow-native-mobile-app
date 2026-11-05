// nativeApp\src\app\(tabs)\khata\udhaar.tsx

import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";

export default function Udhaar() {
    const { t } = useTranslation("khata");
    const title = t("sections.udhaar.title");
    return <PlaceholderScreen title={title} headerTitle={title} />;
}
