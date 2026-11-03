// nativeApp\src\components\ui\chip-group.tsx

import { Pressable, ScrollView, Text, View } from "react-native";

import { cn } from "@/lib/cn";

type Option = { value: string; label: string };
type Props = { options: Option[]; value: string; onChange: (value: string) => void; scroll?: boolean };

/** Single-choice chips, wrapped or horizontally scrollable. */
export function ChipGroup({ options, value, onChange, scroll }: Props) {
    const chips = options.map((o) => {
        const active = o.value === value;
        return (
            <Pressable
                key={o.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => onChange(o.value)}
                className={cn(
                    "min-h-10 justify-center rounded-full border px-4",
                    active ? "border-primary bg-primary-tint" : "border-border-clr bg-white",
                )}>
                <Text className={cn("font-jakarta-semibold text-xs", active ? "text-primary" : "text-text-secondary")}>{o.label}</Text>
            </Pressable>
        );
    });

    return scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
            {chips}
        </ScrollView>
    ) : (
        <View className="flex-row flex-wrap gap-2">{chips}</View>
    );
}