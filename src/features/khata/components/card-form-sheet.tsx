// nativeApp\src\features\khata\components\card-form-sheet.tsx

import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Field, FormButton, Input } from "@/components/ui/form";
import { GradientFill } from "@/components/ui/gradient-fill";
import { AtmCard, GRADIENTS } from "@/features/khata/components/atm-card";
import type { ICard } from "@/features/khata/types";
import { cn } from "@/lib/cn";

const GRADIENT_OPTIONS: { key: ICard["gradient"]; label: string }[] = [
    { key: "primary", label: "Red" },
    { key: "secondary", label: "Green" },
    { key: "dark", label: "Dark" },
];

type Props = {
    visible: boolean;
    card?: ICard | null; // pass a card = EDIT mode
    onClose: () => void;
    onSubmit: (data: Omit<ICard, "id">) => void;
};

export function CardFormSheet({ visible, card, onClose, onSubmit }: Props) {
    const [label, setLabel] = useState("");
    const [balance, setBalance] = useState("");
    const [last4, setLast4] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [gradient, setGradient] = useState<ICard["gradient"]>("primary");

    useEffect(() => {
        if (!visible) return;
        setLabel(card?.label ?? "");
        setBalance(card ? String(card.balance) : "");
        setLast4(card?.last4 ?? "");
        setMonth(card ? String(card.expiryMonth) : "");
        setYear(card ? String(card.expiryYear) : "");
        setGradient(card?.gradient ?? "primary");
    }, [visible, card]);

    const balanceNum = balance === "" ? 0 : Number(balance);
    const m = Number(month);
    const y = Number(year);
    const valid =
        label.trim().length > 0 && /^\d{4}$/.test(last4) && m >= 1 && m <= 12 && year !== "" && y >= 0 && y <= 99 && balanceNum >= 0;

    const submit = () => {
        if (!valid) return;
        onSubmit({ label: label.trim(), balance: balanceNum, last4, expiryMonth: m, expiryYear: y, gradient });
        onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title={card ? "Card Edit Karein" : "Naya Card Add Karein"}
            subtitle="Bank ya wallet ka card, balance yahan track hoga"
            footer={<FormButton label={card ? "Update Karein" : "Card Save Karein"} disabled={!valid} onPress={submit} />}>
            <View className="mb-4 rounded-brand-12 bg-page-bg p-3">
                <AtmCard
                    card={{
                        gradient,
                        label,
                        balance: balance === "" ? undefined : balanceNum,
                        last4,
                        expiryMonth: month === "" ? undefined : m,
                        expiryYear: year === "" ? undefined : y,
                    }}
                />
            </View>

            <Field label="Bank / Card ka naam" required hint="jaise: Meezan Bank, JazzCash">
                <Input placeholder="Meezan Bank" value={label} onChangeText={setLabel} maxLength={24} autoCorrect={false} />
            </Field>

            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Field label="Maujooda balance" hint="Abhi card mein kitne paise hain">
                        <Input prefix="Rs" placeholder="0" keyboardType="decimal-pad" value={balance} onChangeText={(t) => setBalance(t.replace(/[^0-9.]/g, ""))} />
                    </Field>
                </View>
                <View className="flex-1">
                    <Field label="Aakhri 4 digits" required hint="Poora number na likhein">
                        <Input placeholder="1289" keyboardType="number-pad" maxLength={4} value={last4} onChangeText={(t) => setLast4(t.replace(/\D/g, ""))} />
                    </Field>
                </View>
            </View>

            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Field label="Expiry mahina (MM)" required>
                        <Input placeholder="08" keyboardType="number-pad" maxLength={2} value={month} onChangeText={(t) => setMonth(t.replace(/\D/g, ""))} />
                    </Field>
                </View>
                <View className="flex-1">
                    <Field label="Expiry saal (YY)" required>
                        <Input placeholder="28" keyboardType="number-pad" maxLength={2} value={year} onChangeText={(t) => setYear(t.replace(/\D/g, ""))} />
                    </Field>
                </View>
            </View>

            <Field label="Card ka color">
                <View className="flex-row gap-2">
                    {GRADIENT_OPTIONS.map((g) => (
                        <Pressable
                            key={g.key}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: gradient === g.key }}
                            onPress={() => setGradient(g.key)}
                            className={cn(
                                "h-11 flex-1 items-center justify-center overflow-hidden rounded-brand-8 border-2",
                                gradient === g.key ? "border-text-dark" : "border-transparent",
                            )}>
                            <GradientFill colors={GRADIENTS[g.key]} />
                            <Text className="font-jakarta-semibold text-xs text-white">{g.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </Field>
        </BottomSheet>
    );
}