// nativeApp\src\app\(tabs)\khata\business.tsx

import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";

export default function Business() {
    const { t } = useTranslation("khata");
    const title = t("sections.business.title");
    return <PlaceholderScreen title={title} headerTitle={title} />;
}
