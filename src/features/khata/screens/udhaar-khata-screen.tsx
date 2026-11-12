// nativeApp\src\features\khata\screens\udhaar-khata-screen.tsx

import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { Input } from "@/components/ui/form";
import { OptionSheet } from "@/components/ui/option-sheet";
import { useActiveBusiness } from "@/features/business/store/business-store";
import { DataModeBar } from "@/features/khata/components/data-mode-bar";
import { ExportFlow } from "@/features/khata/components/export-flow";
import { PaginationBar } from "@/features/khata/components/pagination-bar";
import { StatCard } from "@/features/khata/components/stat-card";
import { StatsToggleBar } from "@/features/khata/components/stats-toggle-bar";
import { TransactionRow } from "@/features/khata/components/transaction-row";
import { UdhaarActivityChart } from "@/features/khata/components/udhaar-activity-chart";
import { UdhaarBalanceRow } from "@/features/khata/components/udhaar-balance-row";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { useUdhaarStats } from "@/features/khata/hooks/use-udhaar-stats";
import { debtBalances, debtKey, debtLabel, debtSign, pkr } from "@/features/khata/lib/debt";
import type { TransactionsExport } from "@/features/khata/lib/export-transactions-data";
import { useKhataStore } from "@/features/khata/store/khata-store";
import type { IExpenseEntry, IParty, NewParty } from "@/features/khata/types";
import { DebtEntrySheet } from "@/features/party/components/debt-entry-sheet";
import { PartyFormSheet } from "@/features/party/components/party-form-sheet";
import { PARTY_BASE, partyHref } from "@/features/party/lib/party";
import { cn } from "@/lib/cn";
import { entrySortKey, localDate } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

type Filter = "all" | "gave" | "got";

const PAGE_SIZE = 10;
const FILTERS: Filter[] = ["all", "gave", "got"];
const NEW_PARTY = "__new__";
const BALANCE_PREVIEW = 4;

const noop = () => {};
// Two native modals can't swap in the same frame on iOS: let the first one finish closing.
const afterClose = (fn: () => void) => setTimeout(fn, 350);

export default function UdhaarKhataScreen() {
    const { t } = useTranslation(["khata", "common"]);
    const router = useRouter();
    const business = useActiveBusiness();
    const { entries, parties } = useBusinessData();
    const addEntry = useKhataStore((s) => s.addEntry);
    const updateEntry = useKhataStore((s) => s.updateEntry);
    const deleteEntry = useKhataStore((s) => s.deleteEntry);
    const addParty = useKhataStore((s) => s.addParty);
    const stats = useUdhaarStats();

    const [filter, setFilter] = useState<Filter>("all");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [exportOpen, setExportOpen] = useState(false);
    const [showStats, setShowStats] = useState(false); // chart is hidden until the user asks

    // add-entry flow: choose party -> (optional new party) -> You Gave / You Got sheet
    const [sign, setSign] = useState<1 | -1>(1); // 1 = You Gave, -1 = You Got (same as DebtEntrySheet)
    const [pickerOpen, setPickerOpen] = useState(false);
    const [partyFormOpen, setPartyFormOpen] = useState(false);
    const [entryParty, setEntryParty] = useState<IParty | null>(null);
    const [editing, setEditing] = useState<IExpenseEntry | null>(null);

    const debtEntries = useMemo(() => entries.filter((e) => e.kind === "debt"), [entries]);
    const partyById = useMemo(() => new Map(parties.map((p) => [p.id, p])), [parties]);

    // one row per party with a non-zero balance, biggest first
    const balanceRows = useMemo(
        () =>
            [...debtBalances(debtEntries)]
                .filter(([, balance]) => balance !== 0)
                .map(([key, balance]) => {
                    const party = partyById.get(key);
                    const name = party?.name ?? debtEntries.find((e) => debtKey(e) === key)?.subject ?? key;
                    return { key, balance, name, party };
                })
                .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)),
        [debtEntries, partyById],
    );

    const shown = useMemo(() => {
        const k = q.trim().toLowerCase();
        return debtEntries
            .filter((e) => {
                const s = debtSign(e);
                return (
                    (filter === "all" || (filter === "gave" ? s > 0 : s < 0)) &&
                    (!k || `${e.subject} ${debtLabel(e.categoryId)} ${e.description ?? ""}`.toLowerCase().includes(k))
                );
            })
            .sort((a, b) => entrySortKey(b).localeCompare(entrySortKey(a)));
        // `t` changes with the language, so translated debt labels re-evaluate for search
    }, [debtEntries, filter, q, t]);

    // back to page 1 whenever the list itself changes shape
    useEffect(() => setPage(1), [filter, q]);

    // deleting the last row of the last page must not leave us on an empty page
    const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
    const safePage = Math.min(page, pages);
    const pageRows = useMemo(() => shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [shown, safePage]);

    const startEntry = (s: 1 | -1) => {
        setSign(s);
        if (parties.length === 0) setPartyFormOpen(true);
        else setPickerOpen(true);
    };

    const onPickParty = (id: string) => {
        setPickerOpen(false);
        if (id === NEW_PARTY) return afterClose(() => setPartyFormOpen(true));
        const party = partyById.get(id);
        if (party) afterClose(() => setEntryParty(party));
    };

    const onPartySaved = (v: NewParty) => {
        const party = addParty(v); // returns the new party so we can continue straight into the entry sheet
        afterClose(() => setEntryParty(party));
    };

    const closeEntrySheet = () => {
        setEntryParty(null);
        setEditing(null);
    };

    const confirmDelete = (entry: IExpenseEntry) =>
        Alert.alert(t("udhaar.delete.title"), `${entry.subject} · ${pkr(entry.amount)}`, [
            { text: t("common:actions.cancel"), style: "cancel" },
            { text: t("udhaar.delete.confirm"), style: "destructive", onPress: () => deleteEntry(entry.id) },
        ]);

    const buildExportInput = (): TransactionsExport => ({
        title: t("udhaar.export.docTitle", { name: business.name }),
        entries: shown, // everything that matches the filter, not just the current page
        categoryLabel: debtLabel,
        partyName: (id) => (id ? partyById.get(id)?.name : undefined) ?? "",
        cardLabel: () => "-", // udhaar never touches cards
    });

    const sheetParty = editing ? (editing.partyId ? partyById.get(editing.partyId) ?? null : null) : entryParty;

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen
                options={{
                    title: t("sections.udhaar.title"),
                    headerRight: () => (
                        <Pressable accessibilityRole="button" accessibilityLabel={t("udhaar.a11y.export")} onPress={() => setExportOpen(true)} hitSlop={12}>
                            <SymbolView name={{ ios: "square.and.arrow.up", android: "ios_share", web: "ios_share" }} size={21} tintColor={colors["text-secondary"]} />
                        </Pressable>
                    ),
                }}
            />

            <FlatList
                data={pageRows}
                keyExtractor={(e) => e.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 104 }} // room for the sticky action bar
                ListHeaderComponent={
                    <View>
                        <DataModeBar />

                        <View className="flex-row flex-wrap gap-3 px-4 pt-4">
                            {stats.map((item) => (
                                // no real month-over-month number here, so no trend chip
                                <StatCard key={item.id} item={item} onPress={noop} showTrendChip={false} />
                            ))}
                        </View>

                        <View className="mx-4 mt-4 gap-2 rounded-brand-12 border border-border-clr bg-white p-3">
                            <Text className="font-jakarta-semibold text-sm text-text-dark">{t("udhaar.balances.title")}</Text>
                            {balanceRows.length === 0 ? (
                                <View className="rounded-brand-8 bg-success-bg px-3 py-3">
                                    <Text className="text-center font-jakarta-semibold text-xs text-success">{t("udhaar.balances.empty")}</Text>
                                </View>
                            ) : (
                                balanceRows
                                    .slice(0, BALANCE_PREVIEW)
                                    .map((r) => (
                                        <UdhaarBalanceRow
                                            key={r.key}
                                            name={r.name}
                                            balance={r.balance}
                                            onPress={r.party ? () => router.push(partyHref(r.party!)) : undefined}
                                        />
                                    ))
                            )}
                            <Pressable accessibilityRole="link" onPress={() => router.push(PARTY_BASE)} hitSlop={8} className="items-center pt-1">
                                <Text className="font-jakarta-semibold text-xs text-primary">{t("udhaar.balances.viewAll")}</Text>
                            </Pressable>
                        </View>

                        <StatsToggleBar open={showStats} onToggle={() => setShowStats((v) => !v)} />
                        {showStats ? <UdhaarActivityChart entries={debtEntries} /> : null}

                        <View className="flex-row gap-2 px-4 pt-4">
                            {FILTERS.map((f) => (
                                <Pressable
                                    key={f}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: filter === f }}
                                    onPress={() => setFilter(f)}
                                    className={cn(
                                        "min-h-10 justify-center rounded-full border px-4",
                                        filter === f ? "border-primary bg-primary" : "border-border-clr bg-white",
                                    )}>
                                    <Text className={cn("font-jakarta-semibold text-xs", filter === f ? "text-white" : "text-text-secondary")}>
                                        {t(`udhaar.filter.${f}`)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View className="px-4 pb-3 pt-3">
                            <Input
                                icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                                placeholder={t("udhaar.list.search")}
                                value={q}
                                onChangeText={setQ}
                                autoCorrect={false}
                            />
                        </View>

                        <Text className="border-b border-border-clr bg-white px-4 py-2 font-jakarta-semibold text-xs text-text-secondary">
                            {t("udhaar.list.title", { total: shown.length })}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <Text className="p-8 text-center font-jakarta text-sm text-text-secondary-muted">
                        {debtEntries.length === 0 ? t("udhaar.list.empty") : t("udhaar.list.noMatch")}
                    </Text>
                }
                renderItem={({ item }) => (
                    <TransactionRow
                        entry={item}
                        categoryLabel={debtLabel(item.categoryId)}
                        onDelete={confirmDelete}
                        // entries whose party was deleted (or never existed) can't open the party-based sheet
                        onEdit={item.partyId && partyById.has(item.partyId) ? setEditing : undefined}
                    />
                )}
                ListFooterComponent={<PaginationBar page={safePage} pageSize={PAGE_SIZE} total={shown.length} onChange={setPage} />}
            />

            {/* sticky primary actions */}
            <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 border-t border-border-clr bg-white px-4 pb-4 pt-3">
                <Pressable
                    accessibilityRole="button"
                    onPress={() => startEntry(1)}
                    className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-danger shadow-md shadow-black/20 active:opacity-80">
                    <SymbolView name={{ ios: "plus", android: "add", web: "add" }} size={16} tintColor="#FFFFFF" />
                    <Text className="font-jakarta-bold text-sm text-white">{t("udhaar.actions.gave")}</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => startEntry(-1)}
                    className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-success shadow-md shadow-black/20 active:opacity-80">
                    <SymbolView name={{ ios: "plus", android: "add", web: "add" }} size={16} tintColor="#FFFFFF" />
                    <Text className="font-jakarta-bold text-sm text-white">{t("udhaar.actions.got")}</Text>
                </Pressable>
            </View>

            <OptionSheet<string>
                visible={pickerOpen}
                title={t("udhaar.picker.title")}
                options={[...parties.map((p) => ({ value: p.id, label: p.name })), { value: NEW_PARTY, label: t("udhaar.picker.new") }]}
                value=""
                onChange={onPickParty}
                onClose={() => setPickerOpen(false)}
            />
            <ExportFlow
                visible={exportOpen}
                onClose={() => setExportOpen(false)}
                title={t("udhaar.export.title")}
                baseName={`udhaar-khata-${localDate()}`}
                count={shown.length}
                emptyMessage={t("udhaar.export.noEntries")}
                buildInput={buildExportInput}
            />
            <PartyFormSheet
                visible={partyFormOpen}
                defaultType={sign > 0 ? "customer" : "supplier"}
                onClose={() => setPartyFormOpen(false)}
                onSaved={onPartySaved}
            />
            {sheetParty ? (
                <DebtEntrySheet
                    visible
                    party={sheetParty}
                    sign={sign}
                    editing={editing}
                    onClose={closeEntrySheet}
                    onSaved={(payload) => (editing ? updateEntry(editing.id, payload) : addEntry(payload))}
                />
            ) : null}
        </View>
    );
}