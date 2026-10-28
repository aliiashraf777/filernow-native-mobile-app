// nativeApp\src\features\khata\screens\daily-khata-screen.tsx

import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, Text, View } from "react-native";

import { Input } from "@/components/ui/form";
import { OptionSheet } from "@/components/ui/option-sheet";
import { DataModeBar } from "@/features/khata/components/data-mode-bar";
import { StatCard } from "@/features/khata/components/stat-card";
import { TransactionRow } from "@/features/khata/components/transaction-row";
// import { useBusinessData } from "@/features/khata/hooks/use-business-data";
// import { useDailyStats } from "@/features/khata/hooks/use-daily-stats";
import { useBusinessData } from "../hook/use-business-data";
import { useDailyStats } from "../hook/use-daily-stats";
import { pkr } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { type FilterTab, type IExpenseEntry, KHATA_LABELS } from "@/features/khata/types";
import { cn } from "@/lib/cn";
import { entrySortKey } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

type SortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc" | "subject_asc";

const SORTS: { value: SortKey; label: string }[] = [
    { value: "date_desc", label: "Newest first" },
    { value: "date_asc", label: "Oldest first" },
    { value: "amount_desc", label: "Amount: high to low" },
    { value: "amount_asc", label: "Amount: low to high" },
    { value: "subject_asc", label: "Naam (A-Z)" },
];

const COMPARE: Record<SortKey, (a: IExpenseEntry, b: IExpenseEntry) => number> = {
    date_desc: (a, b) => entrySortKey(b).localeCompare(entrySortKey(a)),
    date_asc: (a, b) => entrySortKey(a).localeCompare(entrySortKey(b)),
    amount_desc: (a, b) => b.amount - a.amount,
    amount_asc: (a, b) => a.amount - b.amount,
    subject_asc: (a, b) => a.subject.localeCompare(b.subject),
};

const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "income", label: KHATA_LABELS.income.noun },
    { key: "expense", label: KHATA_LABELS.expense.noun },
    { key: "debt", label: KHATA_LABELS.debt.noun },
];

export default function DailyKhataScreen() {
    const { entries } = useBusinessData();
    const categories = useKhataStore((s) => s.categories);
    const deleteEntry = useKhataStore((s) => s.deleteEntry);
    const stats = useDailyStats();

    const [filter, setFilter] = useState<FilterTab>("all");
    const [q, setQ] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("date_desc");
    const [sortOpen, setSortOpen] = useState(false);

    const categoryLabel = useMemo(() => new Map(categories.map((c) => [c.id, c.label])), [categories]);
    const labelOf = (id: string) => categoryLabel.get(id) ?? "Uncategorized";

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

    const confirmDelete = (entry: IExpenseEntry) =>
        Alert.alert("Entry delete karein?", `${entry.subject} · ${pkr(entry.amount)}`, [
            { text: "Nahi", style: "cancel" },
            { text: "Haan, delete", style: "destructive", onPress: () => deleteEntry(entry.id) },
        ]);

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen options={{ title: "Daily Khata" }} />

            <FlatList
                data={shown}
                keyExtractor={(e) => e.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
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
                                />
                            ))}
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 16 }}>
                            {TABS.map((t) => (
                                <Pressable
                                    key={t.key}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: filter === t.key }}
                                    onPress={() => setFilter(t.key)}
                                    className={cn(
                                        "min-h-10 flex-row items-center gap-2 rounded-full border px-4",
                                        filter === t.key ? "border-primary bg-primary" : "border-border-clr bg-white",
                                    )}>
                                    <Text className={cn("font-jakarta-semibold text-xs", filter === t.key ? "text-white" : "text-text-secondary")}>
                                        {t.label}
                                    </Text>
                                    <Text className={cn("font-jakarta-bold text-[11px]", filter === t.key ? "text-white" : "text-text-secondary-muted")}>
                                        {counts[t.key]}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <View className="flex-row items-center gap-2 px-4 pb-3 pt-3">
                            <View className="flex-1">
                                <Input
                                    icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                                    placeholder="Subject ya category dhoondein"
                                    value={q}
                                    onChangeText={setQ}
                                    autoCorrect={false}
                                />
                            </View>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Sort"
                                onPress={() => setSortOpen(true)}
                                className="h-12 w-12 items-center justify-center rounded-brand-8 border border-border-clr bg-white active:bg-page-bg">
                                <SymbolView
                                    name={{ ios: "arrow.up.arrow.down", android: "swap_vert", web: "swap_vert" }}
                                    size={18}
                                    tintColor={colors["text-secondary"]}
                                />
                                {sortKey !== "date_desc" ? <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" /> : null}
                            </Pressable>
                        </View>

                        <Text className="border-b border-border-clr bg-white px-4 py-2 font-jakarta-semibold text-xs text-text-secondary">
                            Transactions ({shown.length})
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <Text className="p-8 text-center font-jakarta text-sm text-text-secondary-muted">
                        {entries.length === 0
                            ? 'Abhi koi entry nahi. Upar "Load Demo Data" dabayein. Nayi entry add karna agle phase (3B) mein aayega.'
                            : "Is filter mein koi entry nahi mili."}
                    </Text>
                }
                renderItem={({ item }) => (
                    <TransactionRow entry={item} categoryLabel={labelOf(item.categoryId)} onDelete={confirmDelete} />
                )}
            />

            <OptionSheet
                visible={sortOpen}
                title="Tarteeb"
                options={SORTS}
                value={sortKey}
                onChange={setSortKey}
                onClose={() => setSortOpen(false)}
            />
        </View>
    );
}