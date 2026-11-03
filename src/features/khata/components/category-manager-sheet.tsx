// nativeApp\src\features\khata\components\category-manager-sheet.tsx

import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ChipGroup } from "@/components/ui/chip-group";
import { Field, FormButton, Input } from "@/components/ui/form";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { type EntryKind, type ICategory, KHATA_LABELS } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

const KINDS: EntryKind[] = ["income", "expense", "debt"];
const COLOR_OPTIONS: ICategory["color"][] = ["primary", "secondary", "warning", "info", "danger", "neutral"];
const SWATCH: Record<ICategory["color"], string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    warning: "bg-warning",
    info: "bg-info",
    danger: "bg-danger",
    neutral: "bg-text-secondary-muter",
};

type Props = { visible: boolean; onClose: () => void };

export function CategoryManagerSheet({ visible, onClose }: Props) {
    const categories = useKhataStore((s) => s.categories);
    const addCategory = useKhataStore((s) => s.addCategory);
    const deleteCategory = useKhataStore((s) => s.deleteCategory);

    const [tab, setTab] = useState<EntryKind>("expense");
    const [label, setLabel] = useState("");
    const [color, setColor] = useState<ICategory["color"]>("neutral");
    const list = categories.filter((c) => c.kind === tab);

    const confirmDelete = (c: ICategory) =>
        Alert.alert("Category delete karein?", `${c.label} ki entries "Other" mein chali jayengi.`, [
            { text: "Nahi", style: "cancel" },
            { text: "Haan, delete", style: "destructive", onPress: () => deleteCategory(c.id) },
        ]);

    return (
        <BottomSheet visible={visible} onClose={onClose} title="Categories Manage Karein">
            <View className="mb-4">
                <ChipGroup
                    options={KINDS.map((k) => ({ value: k, label: KHATA_LABELS[k].noun }))}
                    value={tab}
                    onChange={(v) => setTab(v as EntryKind)}
                />
            </View>

            {tab === "debt" ? (
                <Text className="mb-3 font-jakarta text-xs text-text-secondary-muter">
                    Udhaar ki categories fixed hain, kyunke party ka balance inhi se tay hota hai.
                </Text>
            ) : (
                <View className="mb-4 rounded-brand-12 border border-border-clr bg-page-bg p-3">
                    <Field label="Naya category">
                        <Input placeholder="jaise: Freelance" value={label} onChangeText={setLabel} autoCorrect={false} />
                    </Field>
                    <View className="mb-3 flex-row items-center gap-3">
                        {COLOR_OPTIONS.map((c) => (
                            <Pressable
                                key={c}
                                accessibilityRole="radio"
                                accessibilityLabel={c}
                                accessibilityState={{ checked: color === c }}
                                onPress={() => setColor(c)}
                                hitSlop={6}
                                className={cn("h-7 w-7 rounded-full border-2", SWATCH[c], color === c ? "border-text-dark" : "border-transparent")}
                            />
                        ))}
                    </View>
                    <FormButton
                        label="Category Add Karein"
                        disabled={!label.trim()}
                        onPress={() => {
                            addCategory(label, color, tab);
                            setLabel("");
                        }}
                    />
                </View>
            )}

            {list.map((c) => {
                const locked = c.kind === "debt" || c.label === "Other";
                return (
                    <View key={c.id} className="min-h-12 flex-row items-center gap-3 border-b border-border-clr">
                        <View className={cn("h-3 w-3 rounded-full", SWATCH[c.color])} />
                        <Text className="flex-1 font-jakarta-medium text-sm text-text-dark">{c.label}</Text>
                        {locked ? (
                            <SymbolView name={{ ios: "lock.fill", android: "lock", web: "lock" }} size={14} tintColor={colors["text-secondary-muter"]} />
                        ) : (
                            <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${c.label}`} onPress={() => confirmDelete(c)} hitSlop={10}>
                                <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} size={17} tintColor={colors["text-secondary-muted"]} />
                            </Pressable>
                        )}
                    </View>
                );
            })}
        </BottomSheet>
    );
}