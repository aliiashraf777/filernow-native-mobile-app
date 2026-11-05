// nativeApp\src\features\khata\components\detailed-entry-sheet.tsx

import { useEffect, useMemo, useState } from "react";
import { TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ChipGroup } from "@/components/ui/chip-group";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Field, FormButton, Input } from "@/components/ui/form";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { pkr } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { type IExpenseEntry, KHATA_LABELS } from "@/features/khata/types";
import { entryTime, localDate, localTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

type Kind = "income" | "expense";
type Props = { visible: boolean; kind: Kind; editing?: IExpenseEntry | null; onClose: () => void };
type Errors = { subject?: string; amount?: string; category?: string };

export function DetailedEntrySheet({ visible, kind, editing, onClose }: Props) {
    const categories = useKhataStore((s) => s.categories);
    const addEntry = useKhataStore((s) => s.addEntry);
    const updateEntry = useKhataStore((s) => s.updateEntry);
    const { cards, parties } = useBusinessData();
    const labels = KHATA_LABELS[kind];

    const categoryOptions = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

    const [subject, setSubject] = useState("");
    const [partyId, setPartyId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(localDate());
    const [time, setTime] = useState(localTime());
    const [cardId, setCardId] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        if (!visible) return;
        setErrors({});
        const first = categoryOptions[0]?.id ?? "";
        if (editing) {
            setSubject(editing.subject);
            setPartyId(editing.partyId ?? "");
            setCategoryId(categoryOptions.some((c) => c.id === editing.categoryId) ? editing.categoryId : first);
            setAmount(String(editing.amount));
            setDate(editing.date.slice(0, 10));
            setTime(entryTime(editing) || localTime());
            setCardId(editing.cardId ?? "");
            setNote(editing.description ?? "");
        } else {
            setSubject("");
            setPartyId("");
            setCategoryId(first);
            setAmount("");
            setDate(localDate());
            setTime(localTime());
            setCardId(""); // Cash by default
            setNote("");
        }
        // reset only when the sheet opens or a different entry is edited
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, editing?.id, kind]);

    const submit = () => {
        const value = Number(amount);
        const next: Errors = {};
        if (subject.trim().length < 2) next.subject = "Zaroori hai (kam az kam 2 huroof)";
        if (!(value > 0)) next.amount = "Sahi amount likhein";
        if (!categoryId) next.category = "Category chunein";
        setErrors(next);
        if (Object.keys(next).length) return;

        const party = parties.find((p) => p.id === partyId);
        const payload = {
            kind,
            subject: subject.trim() || party?.name || "",
            partyId: partyId || undefined,
            categoryId,
            amount: value,
            date,
            time,
            description: note.trim() || undefined,
            cardId: cardId || undefined,
        };
        if (editing) updateEntry(editing.id, payload);
        else addEntry(payload);
        onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title={editing ? `${labels.noun} Edit Karein` : labels.verb}
            subtitle={kind === "income" ? "Jo paise aap ko mile, unka record" : "Jo paise aap ne kharch kiye, unka record"}
            footer={<FormButton label={editing ? "Tabdeeliyan Save Karein" : "Entry Save Karein"} onPress={submit} />}>
            <Field label={labels.subjectLabel} required error={errors.subject}>
                <Input placeholder={labels.subjectPlaceholder} value={subject} onChangeText={setSubject} autoCorrect={false} />
            </Field>

            <Field label="Category" required hint={labels.categoryHint} error={errors.category}>
                <ChipGroup options={categoryOptions.map((c) => ({ value: c.id, label: c.label }))} value={categoryId} onChange={setCategoryId} />
            </Field>

            <Field label="Raqam" required error={errors.amount}>
                <Input
                    prefix="Rs"
                    placeholder="jaise: 5000"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
                />
            </Field>

            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Field label="Tareekh" required>
                        <DateTimeField mode="date" value={date} onChange={setDate} />
                    </Field>
                </View>
                <View className="flex-1">
                    <Field label="Waqt">
                        <DateTimeField mode="time" value={time} onChange={setTime} />
                    </Field>
                </View>
            </View>

            <Field label={labels.cardLabel ?? "Card"} hint="Card chunenge to uska balance khud update ho jayega">
                <ChipGroup
                    options={[{ value: "", label: "Cash" }, ...cards.map((c) => ({ value: c.id, label: `${c.label} · ${pkr(c.balance)}` }))]}
                    value={cardId}
                    onChange={setCardId}
                />
            </Field>

            <Field label="Party" hint="Optional. Kisi party se related ho to chunein">
                <ChipGroup
                    scroll
                    options={[{ value: "", label: "Koi nahi" }, ...parties.map((p) => ({ value: p.id, label: p.name }))]}
                    value={partyId}
                    onChange={setPartyId}
                />
            </Field>

            <Field label="Note" hint="Optional. Baad mein yaad rakhne ke liye">
                <TextInput
                    value={note}
                    onChangeText={setNote}
                    multiline
                    textAlignVertical="top"
                    placeholder="jaise: cash mila"
                    placeholderTextColor={colors["text-secondary-muter"]}
                    className="min-h-[72px] rounded-brand-8 border border-border-clr bg-page-bg p-3 font-jakarta text-sm text-text-dark"
                />
            </Field>
        </BottomSheet>
    );
}