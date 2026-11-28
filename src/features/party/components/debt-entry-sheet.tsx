// nativeApp\src\features\party\components\debt-entry-sheet.tsx

import { ChevronDown, HandCoins, UserRound } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Field, FormButton, Input } from "@/components/ui/form";
import { OptionSheet } from "@/components/ui/option-sheet";
import { debtLabel, debtSign } from "@/features/khata/lib/debt";
import {
    DEBT_TYPE_META,
    type IExpenseEntry,
    type IParty,
} from "@/features/khata/types/types";
import { cn } from "@/lib/cn";
import { entryTime, localDate, localTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

export type DebtEntryPayload = Omit<IExpenseEntry, "id">;
type Errors = { amount?: string; type?: string };

const SHEET_SWAP_DELAY = 350;

type Props = {
    visible: boolean;
    party: IParty;
    /** 1 = You Gave, -1 = You Got. Ignored while editing (taken from the entry). */
    sign: 1 | -1;
    editing?: IExpenseEntry | null;
    defaultCategoryId?: string;
    onClose: () => void;
    onSaved: (entry: DebtEntryPayload) => void;
};

export function DebtEntrySheet({ visible, party, sign, editing, defaultCategoryId, onClose, onSaved }: Props) {
    const { t } = useTranslation("party");
    const activeSign = editing ? debtSign(editing) || sign : sign;
    const options = useMemo(() => Object.values(DEBT_TYPE_META).filter((m) => m.sign === activeSign), [activeSign]);

    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(localDate());
    const [time, setTime] = useState(localTime());
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [paused, setPaused] = useState(false);
    const [typePickerOpen, setTypePickerOpen] = useState(false);

    const selectedType = options.find((option) => option.categoryId === categoryId);
    const typeOptions = options.map((option) => ({ value: option.categoryId, label: debtLabel(option.categoryId) }));

    const openTypePicker = () => {
        if (paused) return;
        setPaused(true);
        setTimeout(() => setTypePickerOpen(true), SHEET_SWAP_DELAY);
    };

    const closeTypePicker = () => {
        setTypePickerOpen(false);
        setTimeout(() => setPaused(false), SHEET_SWAP_DELAY);
    };

    useEffect(() => {
        if (!visible) return;
        setErrors({});
        if (editing) {
            setCategoryId(editing.categoryId);
            setAmount(String(editing.amount));
            setDate(editing.date.slice(0, 10));
            setTime(entryTime(editing) || localTime());
            setNote(editing.description ?? "");
        } else {
            setCategoryId(defaultCategoryId ?? options[0]?.categoryId ?? "");
            setAmount("");
            setDate(localDate());
            setTime(localTime());
            setNote("");
        }
        // reset only when the sheet opens or a different entry is edited
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, editing?.id]);

    const submit = () => {
        const value = Number(amount);
        const next: Errors = {};
        if (!(value > 0)) next.amount = t("entry.amountError");
        if (!categoryId) next.type = t("entry.typeError");
        setErrors(next);
        if (Object.keys(next).length) return;
        onSaved({
            kind: "debt",
            subject: party.name,
            partyId: party.id,
            categoryId,
            amount: value,
            date,
            time,
            description: note.trim() || undefined,
        });
        onClose();
    };

    const gave = activeSign > 0;
    const directionStyle = gave ? "text-danger" : "text-success";
    const partyType = t(`types.${party.type}`);

    return (
        <>
            <BottomSheet
                visible={visible && !paused}
                onClose={onClose}
                title={t(gave ? "entry.gaveTitle" : "entry.gotTitle", { name: party.name })}
                subtitle={editing ? t("entry.editSubtitle") : t("entry.subtitle")}
                headerLeading={
                    <View className="h-10 w-10 items-center justify-center rounded-brand-12 bg-page-bg">
                        <HandCoins size={19} className={directionStyle} strokeWidth={2.2} />
                    </View>
                }
                footer={
                    <FormButton
                        label={editing ? t("entry.saveChanges") : t("entry.save")}
                        onPress={submit}
                        className={gave ? "bg-danger" : "bg-success"}
                    />
                }>
                <Field label={t("title")}>
                    <View className="min-h-12 flex-row items-center gap-2 rounded-brand-12 border border-border-clr bg-white px-3">
                        <UserRound size={17} className="text-text-secondary-muted" />
                        <View className="flex-1">
                            <Text numberOfLines={1} className="font-jakarta-medium text-sm text-text-dark">{party.name}</Text>
                            <Text className="font-jakarta text-[11px] text-text-secondary-muted">{partyType}</Text>
                        </View>
                        <View className={cn("rounded-full px-2 py-1", gave ? "bg-danger-bg" : "bg-success-bg")}>
                            <Text className={cn("font-jakarta-semibold text-[10px]", directionStyle)}>{t(gave ? "ledger.gave" : "ledger.got")}</Text>
                        </View>
                    </View>
                </Field>

                <View className="mb-4 mt-4 flex-row gap-3">
                    <View className="flex-1">
                        <Field label={t("entry.type")} required error={errors.type} className="mb-0">
                            <Pressable
                                accessibilityRole="button"
                                onPress={openTypePicker}
                                className="min-h-12 flex-row items-center justify-between gap-1 rounded-brand-12 border border-border-clr bg-white px-3 active:bg-page-bg">
                                <Text numberOfLines={1} className={cn("flex-1 font-jakarta text-sm", selectedType ? "text-text-dark" : "text-text-secondary-muted")}>
                                    {selectedType ? debtLabel(selectedType.categoryId) : t("entry.choose")}
                                </Text>
                                <ChevronDown size={16} className="text-text-secondary-muted" />
                            </Pressable>
                        </Field>
                    </View>
                    <View className="flex-1">
                        <Field label={t("entry.amount")} required error={errors.amount} className="mb-0">
                            <Input
                                prefix="Rs"
                                placeholder={t("entry.amountPlaceholder")}
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

                <View className="mb-4 flex-row gap-3">
                    <View className="flex-1">
                        <Field label={t("entry.date")} required className="mb-0">
                            <DateTimeField mode="date" value={date} onChange={setDate} placeholder={t("entry.choose")} />
                        </Field>
                    </View>
                    <View className="flex-1">
                        <Field label={t("entry.time")} className="mb-0">
                            <DateTimeField mode="time" value={time} onChange={setTime} placeholder={t("entry.choose")} />
                        </Field>
                    </View>
                </View>

                <Field label={t("entry.note")} hint={t("entry.noteHint")}>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        multiline
                        textAlignVertical="top"
                        placeholder={t("entry.notePlaceholder")}
                        placeholderTextColor={colors["text-secondary-muter"]}
                        className="min-h-[76px] rounded-brand-12 border border-border-clr bg-white p-3 font-jakarta text-sm text-text-dark"
                    />
                </Field>
            </BottomSheet>
            <OptionSheet
                visible={typePickerOpen}
                title={t("entry.type")}
                options={typeOptions}
                value={categoryId}
                onChange={(value) => {
                    setCategoryId(value);
                    setErrors((current) => ({ ...current, type: undefined }));
                }}
                onClose={closeTypePicker}
            />
        </>
    );
}