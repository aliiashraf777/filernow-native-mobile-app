// nativeApp\src\components\ui\option-sheet.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = {
    visible: boolean;
    title: string;
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    onClose: () => void;
};

/** Bottom sheet with a single-choice list. */
export function OptionSheet<T extends string>({ visible, title, options, value, onChange, onClose }: Props<T>) {
    return (
        <BottomSheet visible={visible} onClose={onClose} title={title}>
            {options.map((o) => {
                const selected = o.value === value;
                return (
                    <Pressable
                        key={o.value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => {
                            onChange(o.value);
                            onClose();
                        }}
                        className="min-h-12 flex-row items-center justify-between border-b border-border-clr active:bg-page-bg">
                        <Text className={cn("font-jakarta-medium text-sm", selected ? "text-primary" : "text-text-dark")}>{o.label}</Text>
                        {selected ? (
                            <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={16} tintColor={colors.primary} />
                        ) : null}
                    </Pressable>
                );
            })}
        </BottomSheet>
    );
}