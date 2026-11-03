// nativeApp\src\features\khata\components\cards-manager.tsx

import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AtmCard } from "@/features/khata/components/atm-card";
import { CardFormSheet } from "@/features/khata/components/card-form-sheet";
import { TransferSheet } from "@/features/khata/components/transfer-sheet";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { type ICard, MAX_CARDS } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

function ActionButton({ icon, label, disabled, onPress }: { icon: SymbolViewProps["name"]; label: string; disabled?: boolean; onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!disabled }}
            disabled={disabled}
            onPress={onPress}
            className="min-h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-brand-8 border border-border-clr bg-white active:bg-page-bg"
            style={{ opacity: disabled ? 0.4 : 1 }}>
            <SymbolView name={icon} size={14} tintColor={colors["text-secondary"]} />
            <Text className="font-jakarta-semibold text-xs text-text-secondary">{label}</Text>
        </Pressable>
    );
}

export function CardsManager() {
    const { cards } = useBusinessData();
    const addCard = useKhataStore((s) => s.addCard);
    const updateCard = useKhataStore((s) => s.updateCard);
    const deleteCard = useKhataStore((s) => s.deleteCard);

    const [selectedId, setSelectedId] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<ICard | null>(null);
    const [transferOpen, setTransferOpen] = useState(false);

    const active = cards.find((c) => c.id === selectedId) ?? cards[cards.length - 1];
    const atMax = cards.length >= MAX_CARDS;

    const openForm = (card: ICard | null) => {
        setEditing(card);
        setFormOpen(true);
    };

    const confirmDelete = (card: ICard) =>
        Alert.alert("Card delete karein?", `${card.label}: is se judi entries "Cash" ho jayengi.`, [
            { text: "Nahi", style: "cancel" },
            { text: "Haan, delete", style: "destructive", onPress: () => deleteCard(card.id) },
        ]);

    return (
        <View className="mx-4 mt-4 rounded-brand-12 border border-border-clr bg-white p-3">
            <View className="mb-3 flex-row items-center justify-between">
                <View>
                    <Text className="font-jakarta-bold text-sm text-text-dark">My Cards</Text>
                    <Text className="font-jakarta text-xs text-text-secondary-muter">Apne cards add karein aur balance dekhein</Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    disabled={atMax}
                    onPress={() => openForm(null)}
                    className="min-h-10 flex-row items-center gap-1 rounded-brand-8 border border-border-clr px-3 active:bg-page-bg"
                    style={{ opacity: atMax ? 0.4 : 1 }}>
                    <SymbolView name={{ ios: "plus", android: "add", web: "add" }} size={13} tintColor={colors["text-secondary"]} />
                    <Text className="font-jakarta-semibold text-xs text-text-secondary">Add Card</Text>
                </Pressable>
            </View>

            {active ? (
                <>
                    <AtmCard card={active} />
                    {cards.length > 1 ? (
                        <View className="mt-3 flex-row items-center justify-center gap-2">
                            {cards.map((c) => (
                                <Pressable
                                    key={c.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${c.label} dikhayein`}
                                    onPress={() => setSelectedId(c.id)}
                                    hitSlop={10}
                                    className={cn("h-2 rounded-full", c.id === active.id ? "w-5 bg-primary" : "w-2 bg-border-clr")}
                                />
                            ))}
                        </View>
                    ) : null}
                    <View className="mt-3 flex-row gap-2">
                        <ActionButton icon={{ ios: "pencil", android: "edit", web: "edit" }} label="Edit" onPress={() => openForm(active)} />
                        <ActionButton icon={{ ios: "trash", android: "delete", web: "delete" }} label="Delete" onPress={() => confirmDelete(active)} />
                        <ActionButton
                            icon={{ ios: "arrow.left.arrow.right", android: "swap_horiz", web: "swap_horiz" }}
                            label="Transfer"
                            disabled={cards.length < 2}
                            onPress={() => setTransferOpen(true)}
                        />
                    </View>
                </>
            ) : (
                <View className="items-center gap-1.5 py-6">
                    <SymbolView name={{ ios: "creditcard", android: "credit_card", web: "credit_card" }} size={26} tintColor={colors["text-secondary-muted"]} />
                    <Text className="font-jakarta text-xs text-text-secondary-muted">Abhi koi card nahi hai. Upar &quot;Add Card&quot; dabayein.</Text>
                </View>
            )}

            <CardFormSheet
                visible={formOpen}
                card={editing}
                onClose={() => {
                    setFormOpen(false);
                    setEditing(null);
                }}
                onSubmit={(data) => (editing ? updateCard(editing.id, data) : addCard(data))}
            />
            <TransferSheet visible={transferOpen} onClose={() => setTransferOpen(false)} />
        </View>
    );
}