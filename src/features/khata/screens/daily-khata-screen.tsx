// nativeApp\src\features\khata\screens\daily-khata-screen.tsx

import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { OptionSheet } from "@/components/ui/option-sheet";
import { useActiveBusiness } from "@/features/business/store/business-store";
import { AddEntrySheet } from "@/features/khata/components/add-entry-sheet";
import { CardsManager } from "@/features/khata/components/cards-manager";
import { CategoryManagerSheet } from "@/features/khata/components/category-manager-sheet";
import { DailyCharts } from "@/features/khata/components/daily-charts";
import { DataModeBar } from "@/features/khata/components/data-mode-bar";
import { DetailedEntrySheet } from "@/features/khata/components/detailed-entry-sheet";
import { ExportFlow } from "@/features/khata/components/export-flow";
import { PaginationBar } from "@/features/khata/components/pagination-bar";
import { StatCard, type StatCtaVariant } from "@/features/khata/components/stat-card";
import { StatsToggleBar } from "@/features/khata/components/stats-toggle-bar";
import { TransactionListHeader } from "@/features/khata/components/transaction-list-header";
import { TransactionRow } from "@/features/khata/components/transaction-row";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { useDailyStats } from "@/features/khata/hooks/use-daily-stats";
import { pkr } from "@/features/khata/lib/debt";
import type { TransactionsExport } from "@/features/khata/lib/export-transactions-data";
import { useKhataStore } from "@/features/khata/store/khata-store";
import type { FilterTab, IExpenseEntry } from "@/features/khata/types/types";
import { entrySortKey, localDate } from "@/lib/date-format";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "subject_asc";

const PAGE_SIZE = 10;
/** Add button on the stat cards: "pencil" | "button" | "none". The sticky "+ Add Entry" works either way. */
const STAT_CTA: StatCtaVariant = "pencil";

// Two native modals can't swap in the same frame on iOS: let the first one finish closing.
const afterClose = (fn: () => void) => setTimeout(fn, 350);

const SORT_KEYS: SortKey[] = ["date_desc", "date_asc", "amount_desc", "amount_asc", "subject_asc"];
const TABS: FilterTab[] = ["all", "income", "expense", "debt"];

const COMPARE: Record<SortKey, (a: IExpenseEntry, b: IExpenseEntry) => number> = {
    date_desc: (a, b) => entrySortKey(b).localeCompare(entrySortKey(a)),
    date_asc: (a, b) => entrySortKey(a).localeCompare(entrySortKey(b)),
    amount_desc: (a, b) => b.amount - a.amount,
    amount_asc: (a, b) => a.amount - b.amount,
    subject_asc: (a, b) => a.subject.localeCompare(b.subject),
};

export default function DailyKhataScreen() {
    const { t } = useTranslation(["khata", "common"]);
    const router = useRouter();
    const business = useActiveBusiness();
    const { entries, parties, cards, categories } = useBusinessData();
    // const categories = useKhataStore((s) => s.categories);
    const deleteEntry = useKhataStore((s) => s.deleteEntry);
    const stats = useDailyStats();

    const [filter, setFilter] = useState<FilterTab>("all");
    const [q, setQ] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("date_desc");
    const [sortOpen, setSortOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [entryKind, setEntryKind] = useState<"income" | "expense" | null>(null);
    const [editing, setEditing] = useState<IExpenseEntry | null>(null);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [showStats, setShowStats] = useState(false); // charts are hidden until the user asks
    const [page, setPage] = useState(1);

    const sorts = useMemo(() => SORT_KEYS.map((k) => ({ value: k, label: t(`daily.sort.${k}`) })), [t]);
    const categoryLabel = useMemo(() => new Map(categories.map((c) => [c.id, c.label])), [categories]);
    const labelOf = (id: string) => categoryLabel.get(id) ?? t("daily.list.uncategorized");

    const counts = useMemo<Record<FilterTab, number>>(
        () => ({
            all: entries.length,
            income: entries.filter((e) => e.kind === "income").length,
            expense: entries.filter((e) => e.kind === "expense").length,
            debt: entries.filter((e) => e.kind === "debt").length,
        }),
        [entries],
    );

    const shown = useMemo(() => {
        const k = q.trim().toLowerCase();
        return entries
            .filter(
                (e) =>
                    (filter === "all" || e.kind === filter) &&
                    (!k || `${e.subject} ${categoryLabel.get(e.categoryId) ?? ""} ${e.description ?? ""}`.toLowerCase().includes(k)),
            )
            .sort(COMPARE[sortKey]);
    }, [entries, filter, q, sortKey, categoryLabel]);

    // back to page 1 whenever the list itself changes shape
    useEffect(() => setPage(1), [filter, q, sortKey]);

    // deleting the last row of the last page must not leave us on an empty page
    const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
    const safePage = Math.min(page, pages);
    const pageRows = useMemo(() => shown.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [shown, safePage]);

    const confirmDelete = (entry: IExpenseEntry) =>
        Alert.alert(t("deleteEntry.title"), `${entry.subject} · ${pkr(entry.amount)}`, [
            { text: t("common:actions.cancel"), style: "cancel" },
            { text: t("deleteEntry.confirm"), style: "destructive", onPress: () => deleteEntry(entry.id) },
        ]);

    // ids match both the stat cards and the "Add Entry" picker: income | expense | debt
    const onCta = (id: string) => {
        if (id === "income") setEntryKind("income");
        else if (id === "expense") setEntryKind("expense");
        else if (id === "debt") {
            toast(t("daily.debtHint"));
            router.push("/khata/party");
        }
    };

    const buildExportInput = (): TransactionsExport => ({
        title: t("daily.export.docTitle", { name: business.name }),
        entries: shown, // everything that matches the filter, not just the current page
        categoryLabel: labelOf,
        partyName: (id) => parties.find((p) => p.id === id)?.name ?? "",
        cardLabel: (id) => cards.find((c) => c.id === id)?.label ?? "Cash",
    });

    const sheetKind: "income" | "expense" = editing ? (editing.kind === "income" ? "income" : "expense") : (entryKind ?? "expense");
    const closeEntrySheet = () => {
        setEntryKind(null);
        setEditing(null);
    };

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen
                options={{
                    title: t("sections.daily.title"),
                    headerRight: () => (
                        <View className="flex-row items-center gap-3">
                            <Pressable accessibilityRole="button" accessibilityLabel={t("daily.a11y.export")} onPress={() => setExportOpen(true)} hitSlop={12}>
                                <SymbolView name={{ ios: "square.and.arrow.up", android: "ios_share", web: "ios_share" }} size={21} tintColor={colors["text-secondary"]} />
                            </Pressable>
                            <Pressable accessibilityRole="button" accessibilityLabel={t("daily.a11y.categories")} onPress={() => setCategoriesOpen(true)} hitSlop={12}>
                                <SymbolView name={{ ios: "tag", android: "sell", web: "sell" }} size={22} tintColor={colors.primary} />
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("addEntry.label")}
                                onPress={() => setAddOpen(true)}
                                className="h-9 flex-row items-center gap-1 rounded-brand-12 bg-primary px-2.5 active:opacity-80">
                                <SymbolView name={{ ios: "plus", android: "add", web: "add" }} size={19} tintColor={colors.surface} />
                                <Text numberOfLines={1} className="font-jakarta-bold text-[11px] text-white">
                                    {t("addEntry.label")}
                                </Text>
                            </Pressable>
                        </View>
                    ),
                }}
            />

            <FlatList
                data={pageRows}
                keyExtractor={(e) => e.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 16 }}
                ListHeaderComponent={
                    <View>
                        <DataModeBar />

                        <View className="flex-row flex-wrap gap-3 px-4 pt-4">
                            {stats.map((item) => (
                                <StatCard
                                    key={item.id}
                                    item={item}
                                    active={item.filter !== "all" && filter === item.filter}
                                    onPress={() => setFilter(item.filter)}
                                    ctaVariant={STAT_CTA}
                                    ctaLabel={item.ctaLabel}
                                    onCtaPress={item.ctaLabel ? () => onCta(item.id) : undefined}
                                />
                            ))}
                        </View>

                        <CardsManager />

                        <StatsToggleBar open={showStats} onToggle={() => setShowStats((v) => !v)} />
                        {showStats ? <DailyCharts /> : null}

                        <TransactionListHeader
                            title={t("daily.list.title")}
                            total={shown.length}
                            filters={TABS.map((tab) => ({
                                value: tab,
                                label: tab === "all" ? t("daily.tabs.all") : t(`kind.${tab}`),
                                count: counts[tab],
                            }))}
                            activeFilter={filter}
                            onFilterChange={setFilter}
                            query={q}
                            onQueryChange={setQ}
                            searchPlaceholder={t("daily.list.search")}
                            action={
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={t("daily.a11y.sort")}
                                    onPress={() => setSortOpen(true)}
                                    className="h-9 w-9 items-center justify-center rounded-brand-8 border border-border-clr bg-white active:bg-page-bg">
                                    <SymbolView
                                        name={{ ios: "arrow.up.arrow.down", android: "swap_vert", web: "swap_vert" }}
                                        size={17}
                                        tintColor={colors["text-secondary"]}
                                    />
                                    {sortKey !== "date_desc" ? <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" /> : null}
                                </Pressable>
                            }
                        />
                    </View>
                }
                ListEmptyComponent={
                    <View className="mx-4 rounded-b-brand-16 border-x border-b border-t border-border-clr bg-white px-4 py-8">
                        <Text className="text-center font-jakarta text-sm leading-5 text-text-secondary-muted">
                            {entries.length === 0 ? t("daily.list.empty") : t("daily.list.noMatch")}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TransactionRow
                        entry={item}
                        categoryLabel={labelOf(item.categoryId)}
                        onDelete={confirmDelete}
                        onEdit={item.kind === "debt" ? undefined : setEditing}
                        inSection
                    />
                )}
                ListFooterComponent={
                    <View className="mx-4 min-h-3 rounded-b-brand-16 border-x border-b border-border-clr bg-white">
                        {shown.length > 0 ? (
                            <PaginationBar page={safePage} pageSize={PAGE_SIZE} total={shown.length} onChange={setPage} />
                        ) : null}
                    </View>
                }
            />

            <OptionSheet visible={sortOpen} title={t("daily.sort.title")} options={sorts} value={sortKey} onChange={setSortKey} onClose={() => setSortOpen(false)} />

            <ExportFlow
                visible={exportOpen}
                onClose={() => setExportOpen(false)}
                title={t("daily.export.title")}
                baseName={`daily-khata-${localDate()}`}
                count={shown.length}
                emptyMessage={t("daily.export.noEntries")}
                buildInput={buildExportInput}
            />

            <AddEntrySheet
                visible={addOpen}
                onSelect={(kind) => {
                    setAddOpen(false);
                    afterClose(() => onCta(kind));
                }}
                onClose={() => setAddOpen(false)}
            />
            <DetailedEntrySheet visible={entryKind !== null || editing !== null} kind={sheetKind} editing={editing} onClose={closeEntrySheet} />
            <CategoryManagerSheet visible={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
        </View>
    );
}