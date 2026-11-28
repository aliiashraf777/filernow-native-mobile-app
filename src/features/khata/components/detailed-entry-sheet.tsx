import { ArrowDownLeft, ArrowUpRight, ChevronDown, UserRound, UserRoundPlus } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Field, FormButton, Input } from "@/components/ui/form";
import { OptionSheet } from "@/components/ui/option-sheet";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { pkr } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { type IExpenseEntry } from "@/features/khata/types/types";
import { PartyFormSheet } from "@/features/party/components/party-form-sheet";
import { cn } from "@/lib/cn";
import { entryTime, localDate, localTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

type Kind = "income" | "expense";
type Props = { visible: boolean; kind: Kind; editing?: IExpenseEntry | null; onClose: () => void };
type Errors = { subject?: string; amount?: string; category?: string; card?: string };
type Picker = "party" | "category" | "card";

const SHEET_SWAP_DELAY = 350;

export function DetailedEntrySheet({ visible, kind, editing, onClose }: Props) {
    const { t } = useTranslation(["khata", "common"]);
    const addEntry = useKhataStore((s) => s.addEntry);
    const updateEntry = useKhataStore((s) => s.updateEntry);
    const addParty = useKhataStore((s) => s.addParty);
    const { cards, categories, parties } = useBusinessData();
    const categoryOptions = useMemo(() => categories.filter((c) => c.kind === kind), [categories, kind]);

    const [subject, setSubject] = useState("");
    const [saving, setSaving] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(localDate());
    const [time, setTime] = useState(localTime());
    const [cardId, setCardId] = useState("");
    const [partyId, setPartyId] = useState("");
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [paused, setPaused] = useState(false);
    const [picker, setPicker] = useState<Picker | null>(null);
    const [partyFormOpen, setPartyFormOpen] = useState(false);

    const income = kind === "income";
    const KindIcon = income ? ArrowDownLeft : ArrowUpRight;
    const accent = income ? "text-success" : "text-danger";
    const selectedParty = parties.find((party) => party.id === partyId);
    const selectedCategory = categoryOptions.find((category) => category.id === categoryId);
    const selectedCard = cards.find((card) => card.id === cardId);
    const cardOptions = [
        ...(income ? [{ value: "", label: t("daily.entry.cash") }] : []),
        ...cards.map((card) => ({ value: card.id, label: `${card.label} · ${pkr(card.balance)}` })),
    ];

    const openPicker = (next: Picker) => {
        if (paused) return;
        setPaused(true);
        setTimeout(() => setPicker(next), SHEET_SWAP_DELAY);
    };

    const closePicker = () => {
        setPicker(null);
        setTimeout(() => setPaused(false), SHEET_SWAP_DELAY);
    };

    const openPartyForm = () => {
        if (paused) return;
        setPaused(true);
        setTimeout(() => setPartyFormOpen(true), SHEET_SWAP_DELAY);
    };

    const closePartyForm = () => {
        setPartyFormOpen(false);
        setTimeout(() => setPaused(false), SHEET_SWAP_DELAY);
    };

    useEffect(() => {
        if (!visible) return;
        setErrors({});
        const first = categoryOptions[0]?.id ?? "";
        if (editing) {
            setSubject(editing.subject);
            setCategoryId(categoryOptions.some((c) => c.id === editing.categoryId) ? editing.categoryId : first);
            setAmount(String(editing.amount));
            setDate(editing.date.slice(0, 10));
            setTime(entryTime(editing) || localTime());
            setCardId(editing.cardId ?? "");
            setPartyId(editing.partyId ?? "");
            setNote(editing.description ?? "");
        } else {
            setSubject("");
            setCategoryId(first);
            setAmount("");
            setDate(localDate());
            setTime(localTime());
            setCardId(kind === "expense" ? (cards[0]?.id ?? "") : "");
            setPartyId("");
            setNote("");
        }
        // reset only when the sheet opens or a different entry is edited
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, editing?.id, kind]);

    const submit = async () => {
        if (saving) return;
        const value = Number(amount);
        const next: Errors = {};
        if (subject.trim().length < 2) next.subject = t("daily.entry.errors.subject");
        if (!(value > 0)) next.amount = t("daily.entry.errors.amount");
        if (!categoryId) next.category = t("daily.entry.errors.category");
        if (kind === "expense" && !cardId) {
            next.card = cards.length ? t("daily.entry.errors.card") : t("daily.entry.errors.noCards");
        }
        setErrors(next);
        if (Object.keys(next).length) return;

        const payload = {
            kind,
            subject: subject.trim(),
            categoryId,
            amount: value,
            date,
            time,
            description: note.trim() || undefined,
            cardId: cardId || undefined,
            partyId: partyId || undefined,
        };
        setSaving(true);
        const ok = editing ? updateEntry(editing.id, payload) : await addEntry(payload);
        setSaving(false);
        if (ok) onClose();
    };

    return (
        <>
            <BottomSheet
                visible={visible && !paused}
                onClose={onClose}
                title={t(editing ? "daily.entry.editTitle" : "daily.entry.title", { kind: t(`kind.${kind}`) })}
                subtitle={t(`daily.entry.${kind}Subtitle`)}
                headerLeading={
                    <View className="h-10 w-10 items-center justify-center rounded-brand-12 bg-page-bg">
                        <KindIcon size={19} className={accent} strokeWidth={2.2} />
                    </View>
                }
                footer={
                    <FormButton
                        label={t(saving ? "daily.entry.saving" : editing ? "daily.entry.saveChanges" : "daily.entry.save")}
                        onPress={submit}
                        disabled={saving}
                        className={income ? "bg-success" : "bg-danger"}
                    />
                }>
                <Field label={t("daily.entry.party")} hint={t("daily.entry.partyHint")}>
                    <View className="flex-row gap-2">
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => openPicker("party")}
                            className="min-h-12 flex-1 flex-row items-center gap-2 rounded-brand-12 border border-border-clr bg-white px-3 active:bg-page-bg">
                            <UserRound size={17} className="text-text-secondary-muted" />
                            <Text numberOfLines={1} className={cn("flex-1 font-jakarta text-sm", selectedParty ? "text-text-dark" : "text-text-secondary-muted")}>
                                {selectedParty?.name ?? t("daily.entry.noParty")}
                            </Text>
                            <ChevronDown size={16} className="text-text-secondary-muted" />
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("daily.entry.addParty")}
                            onPress={openPartyForm}
                            className="h-12 w-12 items-center justify-center rounded-brand-12 border border-primary bg-white active:bg-page-bg">
                            <UserRoundPlus size={18} className="text-primary" />
                        </Pressable>
                    </View>
                </Field>

                <Field
                    label={t(`daily.entry.${kind}Subject`)}
                    required
                    hint={t("daily.entry.subjectHint")}
                    error={errors.subject}>
                    <Input
                        placeholder={t(`daily.entry.${kind}Placeholder`)}
                        value={subject}
                        onChangeText={(value) => {
                            setSubject(value);
                            setErrors((current) => ({ ...current, subject: undefined }));
                        }}
                        autoCorrect={false}
                    />
                </Field>

                <View className="mb-4 flex-row gap-3">
                    <View className="flex-1">
                        <Field label={t("daily.entry.category")} required error={errors.category} className="mb-0">
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => openPicker("category")}
                                className="min-h-12 flex-row items-center justify-between gap-1 rounded-brand-12 border border-border-clr bg-white px-3 active:bg-page-bg">
                                <Text numberOfLines={1} className={cn("flex-1 font-jakarta text-sm", selectedCategory ? "text-text-dark" : "text-text-secondary-muted")}>
                                    {selectedCategory?.label ?? t("daily.entry.choose")}
                                </Text>
                                <ChevronDown size={16} className="text-text-secondary-muted" />
                            </Pressable>
                        </Field>
                    </View>
                    <View className="flex-1">
                        <Field label={t("daily.entry.amount")} required error={errors.amount} className="mb-0">
                            <Input
                                prefix="Rs"
                                placeholder={t("daily.entry.amountPlaceholder")}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={(value) => {
                                    setAmount(value.replace(/[^0-9.]/g, ""));
                                    setErrors((current) => ({ ...current, amount: undefined }));
                                }}
                            />
                        </Field>
                    </View>
                </View>

                <Field
                    label={t(`daily.entry.${kind}CardLabel`)}
                    required={kind === "expense"}
                    error={errors.card}
                    hint={t("daily.entry.balanceHint")}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => openPicker("card")}
                        className="min-h-12 flex-row items-center justify-between rounded-brand-12 border border-border-clr bg-white px-3 active:bg-page-bg">
                        <Text numberOfLines={1} className={cn("flex-1 font-jakarta text-sm", selectedCard || (income && !cardId) ? "text-text-dark" : "text-text-secondary-muted")}>
                            {selectedCard ? `${selectedCard.label} · ${pkr(selectedCard.balance)}` : income && !cardId ? t("daily.entry.cash") : t("daily.entry.choose")}
                        </Text>
                        <ChevronDown size={16} className="text-text-secondary-muted" />
                    </Pressable>
                </Field>

                <View className="mb-4 flex-row gap-3">
                    <View className="flex-1">
                        <Field label={t("daily.entry.date")} required className="mb-0">
                            <DateTimeField mode="date" value={date} onChange={setDate} placeholder={t("daily.entry.choose")} />
                        </Field>
                    </View>
                    <View className="flex-1">
                        <Field label={t("daily.entry.time")} className="mb-0">
                            <DateTimeField mode="time" value={time} onChange={setTime} placeholder={t("daily.entry.choose")} />
                        </Field>
                    </View>
                </View>

                <Field label={t("daily.entry.note")} hint={t("daily.entry.noteHint")}>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        multiline
                        textAlignVertical="top"
                        placeholder={t("daily.entry.notePlaceholder")}
                        placeholderTextColor={colors["text-secondary-muter"]}
                        className="min-h-[76px] rounded-brand-12 border border-border-clr bg-white p-3 font-jakarta text-sm text-text-dark"
                    />
                </Field>
            </BottomSheet>
            <OptionSheet
                visible={picker === "party"}
                title={t("daily.entry.chooseParty")}
                options={[
                    { value: "", label: t("daily.entry.noParty") },
                    ...parties.map((party) => ({ value: party.id, label: party.name })),
                ]}
                value={partyId}
                onChange={setPartyId}
                onClose={closePicker}
            />
            <OptionSheet
                visible={picker === "category"}
                title={t("daily.entry.chooseCategory")}
                options={categoryOptions.map((category) => ({ value: category.id, label: category.label }))}
                value={categoryId}
                onChange={(value) => {
                    setCategoryId(value);
                    setErrors((current) => ({ ...current, category: undefined }));
                }}
                onClose={closePicker}
            />
            <OptionSheet
                visible={picker === "card"}
                title={t("daily.entry.chooseCard")}
                options={cardOptions}
                value={cardId}
                onChange={(value) => {
                    setCardId(value);
                    setErrors((current) => ({ ...current, card: undefined }));
                }}
                onClose={closePicker}
            />
            <PartyFormSheet
                visible={partyFormOpen}
                onClose={closePartyForm}
                onSaved={(value) => {
                    const party = addParty(value);
                    setPartyId(party.id);
                }}
            />
        </>
    );
}
