// nativeApp\src\features\khata\components\transfer-sheet.tsx

import { useEffect, useState } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ChipGroup } from "@/components/ui/chip-group";
import { Field, FormButton, Input } from "@/components/ui/form";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { pkr } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";

type Props = { visible: boolean; onClose: () => void };

export function TransferSheet({ visible, onClose }: Props) {
    const { cards } = useBusinessData();
    const transferBetweenCards = useKhataStore((s) => s.transferBetweenCards);
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        if (visible) {
            setFromId("");
            setToId("");
            setAmount("");
        }
    }, [visible]);

    const from = cards.find((c) => c.id === fromId) ?? cards[0];
    const destinations = cards.filter((c) => c.id !== from?.id);
    const to = destinations.find((c) => c.id === toId) ?? destinations[0];
    const value = Number(amount);
    const tooMuch = value > (from?.balance ?? 0);
    const canTransfer = Boolean(from && to) && value > 0 && !tooMuch;

    const option = (c: { id: string; label: string; balance: number }) => ({ value: c.id, label: `${c.label} · ${pkr(c.balance)}` });

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Paisay Transfer Karein"
            subtitle="Ek card se doosre card mein"
            footer={
                <FormButton
                    label="Transfer Karein"
                    disabled={!canTransfer}
                    onPress={() => {
                        if (!from || !to) return;
                        transferBetweenCards(from.id, to.id, value);
                        onClose();
                    }}
                />
            }>
            <Field label="Kis card se (From)">
                <ChipGroup options={cards.map(option)} value={from?.id ?? ""} onChange={setFromId} />
            </Field>
            <Field label="Kis card mein (To)">
                <ChipGroup options={destinations.map(option)} value={to?.id ?? ""} onChange={setToId} />
            </Field>
            <Field
                label="Raqam"
                required
                hint={from ? `${from.label} mein available: ${pkr(from.balance)}` : undefined}
                error={amount && tooMuch ? `Itna balance nahi hai (available ${pkr(from?.balance ?? 0)})` : undefined}>
                <Input prefix="Rs" placeholder="jaise: 5000" keyboardType="decimal-pad" value={amount} onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))} />
            </Field>
        </BottomSheet>
    );
}