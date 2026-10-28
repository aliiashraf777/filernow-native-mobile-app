// nativeApp\src\features\khata\components\data-mode-bar.tsx

import { Alert, Pressable, Text, View } from "react-native";

import { useKhataStore } from "@/features/khata/store/khata-store";
import { cn } from "@/lib/cn";
import { useBusinessData } from "../hook/use-business-data";

export function DataModeBar() {
    // const dataMode = useKhataStore((s) => s.dataMode);
    // const hasData = useKhataStore((s) => s.entries.length + s.cards.length + s.parties.length > 0);
    const { dataMode, entries, cards, parties } = useBusinessData();
    const hasData = entries.length + cards.length + parties.length > 0;

    const loadDemoData = useKhataStore((s) => s.loadDemoData);
    const resetToBlank = useKhataStore((s) => s.resetToBlank);
    const isDemo = dataMode === "demo";

    const apply = () => (isDemo ? resetToBlank() : loadDemoData());
    const onPress = () =>
        hasData
            ? Alert.alert("Maujooda data replace hoga", "Pakka?", [
                { text: "Nahi", style: "cancel" },
                { text: "Haan", onPress: apply },
            ])
            : apply();

    return (
        <View className="mx-4 mt-4 flex-row items-center justify-between rounded-brand-12 border border-border-clr bg-white px-3 py-2.5">
            <View className="flex-row items-center gap-2">
                <View className={cn("h-2 w-2 rounded-full", isDemo ? "bg-warning" : "bg-success")} />
                <Text className="font-jakarta-medium text-xs text-text-secondary">Mode: {isDemo ? "Demo" : "Blank"}</Text>
            </View>
            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                className="min-h-10 justify-center rounded-brand-8 border border-border-clr px-3 active:bg-page-bg">
                <Text className="font-jakarta-semibold text-xs text-text-secondary">
                    {isDemo ? "Start Fresh" : "Load Demo Data"}
                </Text>
            </Pressable>
        </View>
    );
}