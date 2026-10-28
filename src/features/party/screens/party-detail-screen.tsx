// nativeApp\src\features\party\screens\party-detail-screen.tsx

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { Input } from "@/components/ui/form";
import { PlaceholderScreen } from "@/components/ui/placeholder-screen";
import { buildLedger, debtLabel } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { DEBT_TYPE_META, type IExpenseEntry, PARTY_TYPE_LABELS } from "@/features/khata/types";
import { DebtEntrySheet } from "@/features/party/components/debt-entry-sheet";
import { LedgerHeader, LedgerRowItem } from "@/features/party/components/ledger";
import { PartyBalanceCard } from "@/features/party/components/party-balance-card";
import { PartyFormSheet } from "@/features/party/components/party-form-sheet";
import { ReminderDateSheet } from "@/features/party/components/reminder-date-sheet";
import { contactBlockReason, openSms, openWhatsApp, reminderText, waDigits } from "@/features/party/lib/party-contact";
import { PARTY_BASE, partyHref } from "@/features/party/lib/party";
import { formatDateTime } from "@/lib/date-format";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";
import { useBusinessData } from "@/features/khata/hook/use-business-data";

type IconName = SymbolViewProps["name"];

function ActionButton({ icon, label, sub, disabled, onPress }: { icon: IconName; label: string; sub?: string; disabled?: boolean; onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!disabled }}
            onPress={onPress}
            className="min-h-[64px] grow basis-[47%] items-center justify-center gap-1 rounded-brand-12 border border-border-clr bg-white py-2 active:opacity-80"
            style={{ opacity: disabled ? 0.45 : 1 }}>
            <SymbolView name={icon} size={18} tintColor={colors.warning} />
            <Text className="font-jakarta-medium text-xs text-text-dark">{label}</Text>
            {sub ? <Text className="font-jakarta-semibold text-[11px] text-primary">{sub}</Text> : null}
        </Pressable>
    );
}

export default function PartyDetailScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const router = useRouter();
    // const party = useKhataStore((s) => s.parties.find((p) => p.slug === slug || p.id === slug));
    // const entries = useKhataStore((s) => s.entries);
    const { parties, entries } = useBusinessData();
    const party = parties.find((p) => p.slug === slug || p.id === slug);
    const addEntry = useKhataStore((s) => s.addEntry);
    const updateEntry = useKhataStore((s) => s.updateEntry);
    const deleteEntry = useKhataStore((s) => s.deleteEntry);
    const updateParty = useKhataStore((s) => s.updateParty);
    const deleteParty = useKhataStore((s) => s.deleteParty);

    const [txn, setTxn] = useState<1 | -1 | null>(null); // 1 = You Gave, -1 = You Got
    const [editing, setEditing] = useState<IExpenseEntry | null>(null);
    const [partyFormOpen, setPartyFormOpen] = useState(false);
    const [reminderOpen, setReminderOpen] = useState(false);
    const [q, setQ] = useState("");

    const rows = useMemo(() => buildLedger(entries, party?.id ?? ""), [entries, party?.id]);
    const balance = rows.length ? rows[rows.length - 1].balance : 0;
    const { gave, got } = useMemo(
        () => ({
            gave: rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0),
            got: rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0),
        }),
        [rows],
    );
    const shown = useMemo(() => {
        const k = q.trim().toLowerCase();
        const list = k ? rows.filter((r) => `${debtLabel(r.entry.categoryId)} ${r.entry.description ?? ""}`.toLowerCase().includes(k)) : rows;
        return [...list].reverse(); // newest first
    }, [rows, q]);

    if (!party) return <PlaceholderScreen title="Party nahi mili" headerTitle="Party" />;

    const blocked = contactBlockReason(party, balance);
    const contact = async (kind: "wa" | "sms") => {
        if (blocked) return toast(blocked);
        const text = reminderText(party, balance);
        try {
            if (kind === "wa") await openWhatsApp(waDigits(party.phone)!, text);
            else await openSms(party.phone!, text);
        } catch {
            toast.error("App khul nahi saki");
        }
    };

    const confirmDeleteParty = () =>
        Alert.alert(
            "Party delete karein?",
            rows.length > 0 ? `${party.name} aur uski ${rows.length} entries delete ho jayengi.` : party.name,
            [
                { text: "Nahi", style: "cancel" },
                {
                    text: "Haan, delete",
                    style: "destructive",
                    onPress: () => {
                        if (deleteParty(party.id, true)) router.replace(PARTY_BASE as never);
                    },
                },
            ],
        );

    const confirmDeleteEntry = (entry: IExpenseEntry) =>
        Alert.alert("Entry delete karein?", `${debtLabel(entry.categoryId)} · Rs ${entry.amount.toLocaleString("en-PK")}`, [
            { text: "Nahi", style: "cancel" },
            { text: "Haan, delete", style: "destructive", onPress: () => deleteEntry(entry.id) },
        ]);

    const defaultCategoryId =
        txn === 1
            ? DEBT_TYPE_META[balance < 0 ? "liya_wapis_diya" : "diya"].categoryId
            : txn === -1
                ? DEBT_TYPE_META[balance > 0 ? "diya_wapis_liya" : "liya"].categoryId
                : undefined;

    const closeEntrySheet = () => {
        setTxn(null);
        setEditing(null);
    };

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen
                options={{
                    title: party.name,
                    headerRight: () => (
                        <View className="flex-row items-center gap-5">
                            <Pressable accessibilityRole="button" accessibilityLabel="Edit party" onPress={() => setPartyFormOpen(true)} hitSlop={10}>
                                <SymbolView name={{ ios: "pencil", android: "edit", web: "edit" }} size={20} tintColor={colors["text-secondary"]} />
                            </Pressable>
                            <Pressable accessibilityRole="button" accessibilityLabel="Delete party" onPress={confirmDeleteParty} hitSlop={10}>
                                <SymbolView name={{ ios: "trash", android: "delete", web: "delete" }} size={20} tintColor={colors["text-secondary-muted"]} />
                            </Pressable>
                        </View>
                    ),
                }}
            />

            <FlatList
                data={shown}
                keyExtractor={(r) => r.entry.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 96 }}
                ListHeaderComponent={
                    <>
                        <View className="gap-3 p-4">
                            <Text className="font-jakarta text-xs text-text-secondary-muted">
                                {PARTY_TYPE_LABELS[party.type]} · {party.phone ?? "No number"}
                            </Text>
                            <PartyBalanceCard balance={balance} gave={gave} got={got} count={rows.length} />

                            <View className="flex-row flex-wrap gap-2">
                                <ActionButton
                                    icon={{ ios: "doc.text", android: "description", web: "description" }}
                                    label="Report"
                                    onPress={() => router.push(partyHref(party, "/report"))}
                                />
                                <ActionButton
                                    icon={{ ios: "calendar.badge.plus", android: "event", web: "event" }}
                                    label="Set Reminder Date"
                                    sub={party.reminderDate ? formatDateTime(party.reminderDate) : undefined}
                                    onPress={() => setReminderOpen(true)}
                                />
                                <ActionButton
                                    icon={{ ios: "message.fill", android: "chat", web: "chat" }}
                                    label="WhatsApp Reminder"
                                    disabled={!!blocked}
                                    onPress={() => contact("wa")}
                                />
                                <ActionButton
                                    icon={{ ios: "text.bubble.fill", android: "sms", web: "sms" }}
                                    label="SMS"
                                    disabled={!!blocked}
                                    onPress={() => contact("sms")}
                                />
                            </View>

                            <Input
                                icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                                placeholder="Entries mein dhoondein (qism ya note)"
                                value={q}
                                onChangeText={setQ}
                                autoCorrect={false}
                            />
                        </View>
                        <LedgerHeader count={shown.length} />
                    </>
                }
                ListEmptyComponent={
                    <Text className="p-8 text-center font-jakarta text-sm text-text-secondary-muted">
                        Koi entry nahi mili. Neeche se pehli entry add karein.
                    </Text>
                }
                renderItem={({ item }) => <LedgerRowItem row={item} onEdit={setEditing} onDelete={confirmDeleteEntry} />}
            />

            <View className="absolute inset-x-0 bottom-0 flex-row gap-3 border-t border-border-clr bg-white p-3">
                <Pressable
                    accessibilityRole="button"
                    onPress={() => setTxn(1)}
                    className="min-h-12 flex-1 items-center justify-center rounded-full bg-danger active:opacity-80">
                    <Text className="font-jakarta-bold text-xs uppercase text-white">Apne Diye (Gave) Rs</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => setTxn(-1)}
                    className="min-h-12 flex-1 items-center justify-center rounded-full bg-success active:opacity-80">
                    <Text className="font-jakarta-bold text-xs uppercase text-white">Apne Liye (Got) Rs</Text>
                </Pressable>
            </View>

            <DebtEntrySheet
                visible={txn !== null || editing !== null}
                party={party}
                sign={txn ?? 1}
                editing={editing}
                defaultCategoryId={defaultCategoryId}
                onClose={closeEntrySheet}
                onSaved={(v) => (editing ? updateEntry(editing.id, v) : addEntry(v))}
            />
            <PartyFormSheet
                visible={partyFormOpen}
                party={party}
                onClose={() => setPartyFormOpen(false)}
                onSaved={(v) => {
                    updateParty(party.id, v);
                    toast.success("Party update ho gayi");
                }}
            />
            <ReminderDateSheet
                visible={reminderOpen}
                name={party.name}
                current={party.reminderDate}
                onClose={() => setReminderOpen(false)}
                onSave={(d) => {
                    updateParty(party.id, { reminderDate: d });
                    toast.success(`Reminder date set: ${d}`);
                }}
                onClear={() => {
                    updateParty(party.id, { reminderDate: undefined });
                    toast.success("Reminder date hata di gayi");
                }}
            />
        </View>
    );
}