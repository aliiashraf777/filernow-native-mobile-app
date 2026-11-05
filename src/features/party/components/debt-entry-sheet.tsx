// nativeApp\src\features\party\components\debt-entry-sheet.tsx

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Field, FormButton, Input } from "@/components/ui/form";
import { debtLabel, debtSign } from "@/features/khata/lib/debt";
import {
    DEBT_CATEGORY_TYPE,
    DEBT_TYPE_META,
    type IExpenseEntry,
    type IParty,
} from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { entryTime, localDate, localTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

export type DebtEntryPayload = Omit<IExpenseEntry, "id">;

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
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (!visible) return;
        setError(undefined);
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
        if (!(value > 0)) return setError(t("entry.amountError"));
        if (!categoryId) return setError(t("entry.typeError"));
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
    const debtType = DEBT_CATEGORY_TYPE[categoryId];

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title={t(gave ? "entry.gaveTitle" : "entry.gotTitle", { name: party.name })}
            subtitle={editing ? t("entry.editSubtitle") : t("entry.subtitle")}
            footer={
                <FormButton
                    label={editing ? t("entry.saveChanges") : t("entry.save")}
                    onPress={submit}
                    className={gave ? "bg-danger" : "bg-success"}
                />
            }>
            <Field label={t("entry.type")} required hint={debtType ? t(`debtTypes.${debtType}.hint`) : undefined}>
                <View className="gap-2">
                    {options.map((o) => {
                        const active = o.categoryId === categoryId;
                        return (
                            <Pressable
                                key={o.categoryId}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: active }}
                                onPress={() => setCategoryId(o.categoryId)}
                                className={cn(
                                    "min-h-12 justify-center rounded-brand-8 border px-3",
                                    active ? "border-primary bg-primary-tint" : "border-border-clr bg-page-bg",
                                )}>
                                <Text className={cn("font-jakarta-semibold text-sm", active ? "text-primary" : "text-text-dark")}>{debtLabel(o.categoryId)}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </Field>

            <Field label={t("entry.amount")} required error={error}>
                <Input
                    prefix="Rs"
                    placeholder={t("entry.amountPlaceholder")}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(t) => {
                        setAmount(t.replace(/[^0-9.]/g, ""));
                        setError(undefined);
                    }}
                />
            </Field>

            <View className="flex-row gap-3">
                <View className="flex-1">
                    <Field label={t("entry.date")} required>
                        <DateTimeField mode="date" value={date} onChange={setDate} />
                    </Field>
                </View>
                <View className="flex-1">
                    <Field label={t("entry.time")}>
                        <DateTimeField mode="time" value={time} onChange={setTime} />
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
                    className="min-h-[72px] rounded-brand-8 border border-border-clr bg-page-bg p-3 font-jakarta text-sm text-text-dark"
                />
            </Field>
        </BottomSheet>
    );
}