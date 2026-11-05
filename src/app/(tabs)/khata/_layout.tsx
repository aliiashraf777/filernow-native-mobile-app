// nativeApp\src\app\(tabs)\khata\_layout.tsx

import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme/tokens";
import { StackHeader } from "@/components/ui/stack-header";

export default function KhataLayout() {
    const { t } = useTranslation("khata");
    return (
        <Stack
            screenOptions={{
                // headerTintColor: colors["text-dark"],
                // headerTitleStyle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 16 },
                // headerShadowVisible: false,
                header: (props) => <StackHeader {...props} />,
                contentStyle: { backgroundColor: colors["page-bg"] },
            }}>
            <Stack.Screen name="index" options={{ title: t("title") }} />
        </Stack>
    );
}