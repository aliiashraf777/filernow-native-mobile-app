// nativeApp\src\features\party\screens\party-list-screen.tsx

import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { Input } from "@/components/ui/form";
import { debtBalances } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";
import {
    type IExpenseEntry,
    type IParty,
    type NewParty,
    PARTY_TYPES,
    type PartyType,
} from "@/features/khata/types";
import { BalanceOverview } from "@/features/party/components/balance-overview";
import { BulkPartySheet } from "@/features/party/components/bulk-party-sheet";
import { type BalanceFilter, PartyFilterSheet, type SortBy } from "@/features/party/components/party-filter-sheet";
import { PartyFormSheet } from "@/features/party/components/party-form-sheet";
import { PartyRow } from "@/features/party/components/party-row";
import { partyHref } from "@/features/party/lib/party";
import { entryDateTime, entrySortKey } from "@/lib/date-format";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";

type Row = { party: IParty; balance: number; last?: IExpenseEntry; count: number };
type Tab = "all" | PartyType;

// labels: party:typesPlural.<key>
const TABS: Tab[] = ["all", ...PARTY_TYPES];

export default function PartyListScreen() {
    const { t } = useTranslation(["party", "common"]);
    const router = useRouter();
    // const parties = useKhataStore((s) => s.parties);
    // const entries = useKhataStore((s) => s.entries);
    const {parties, entries} = useBusinessData();
    const addParty = useKhataStore((s) => s.addParty);
    const addParties = useKhataStore((s) => s.addParties);
    const updateParty = useKhataStore((s) => s.updateParty);
    const deleteParty = useKhataStore((s) => s.deleteParty);

    const [tab, setTab] = useState<Tab>("all");
    const [q, setQ] = useState("");
    const [hidden, setHidden] = useState(false);
    const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("recent");
    const [editing, setEditing] = useState<IParty | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    // balance + latest entry per party
    const rows = useMemo<Row[]>(() => {
        const balances = debtBalances(entries);
        const last = new Map<string, IExpenseEntry>();
        const counts = new Map<string, number>();
        for (const e of entries) {
            if (!e.partyId) continue;
            counts.set(e.partyId, (counts.get(e.partyId) ?? 0) + 1);
            const cur = last.get(e.partyId);
            if (!cur || entrySortKey(e) > entrySortKey(cur)) last.set(e.partyId, e);
        }
        return parties.map((party) => ({
            party,
            balance: balances.get(party.id) ?? 0,
            last: last.get(party.id),
            count: counts.get(party.id) ?? 0,
        }));
    }, [parties, entries]);

    const inTab = useMemo(() => rows.filter((r) => tab === "all" || r.party.type === tab), [rows, tab]);

    const { get, give, getCount, giveCount } = useMemo(() => {
        let get = 0, give = 0, getCount = 0, giveCount = 0;
        inTab.forEach((r) => {
            if (r.balance > 0) { get += r.balance; getCount++; }
            else if (r.balance < 0) { give -= r.balance; giveCount++; }
        });
        return { get, give, getCount, giveCount };
    }, [inTab]);

    const shown = useMemo(() => {
        const k = q.trim().toLowerCase();
        const list = inTab.filter(
            (r) =>
                (!k || r.party.name.toLowerCase().includes(k) || (r.party.phone ?? "").includes(k)) &&
                (balanceFilter === "all" ||
                    (balanceFilter === "get" && r.balance > 0) ||
                    (balanceFilter === "give" && r.balance < 0) ||
                    (balanceFilter === "settled" && r.balance === 0)),
        );
        const key = (r: Row) => (r.last ? entrySortKey(r.last) : r.party.createdAt);
        return [...list].sort((a, b) =>
            sortBy === "name"
                ? a.party.name.localeCompare(b.party.name)
                : sortBy === "balance"
                    ? Math.abs(b.balance) - Math.abs(a.balance)
                    : key(b).localeCompare(key(a)),
        );
    }, [inTab, q, balanceFilter, sortBy]);

    const filterActive = balanceFilter !== "all" || sortBy !== "recent";

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
    };

    const handleSaved = (v: NewParty) => {
        if (editing) {
            updateParty(editing.id, v);
            toast.success(t("list.updated"));
        } else {
            addParty(v);
        }
    };

    const confirmDelete = (r: Row) =>
        Alert.alert(
            t("list.deleteTitle"),
            r.count > 0 ? t("list.deleteWithEntries", { name: r.party.name, count: r.count }) : r.party.name,
            [
                { text: t("common:actions.no"), style: "cancel" },
                { text: t("list.yesDelete"), style: "destructive", onPress: () => deleteParty(r.party.id, true) },
            ],
        );

    const openMenu = (r: Row) =>
        Alert.alert(r.party.name, undefined, [
            { text: t("common:actions.edit"), onPress: () => { setEditing(r.party); setFormOpen(true); } },
            { text: t("common:actions.delete"), style: "destructive", onPress: () => confirmDelete(r) },
            { text: t("common:actions.cancel"), style: "cancel" },
        ]);

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen
                options={{
                    title: t("title"),
                    headerRight: () => (
                        <Pressable accessibilityRole="button" accessibilityLabel={t("list.bulkAddA11y")} onPress={() => setBulkOpen(true)} hitSlop={12}>
                            <SymbolView
                                name={{ ios: "person.3.fill", android: "groups", web: "groups" }}
                                size={22}
                                tintColor={colors.primary}
                            />
                        </Pressable>
                    ),
                }}
            />

            <View className="flex-row gap-2 px-4 pt-3">
                {TABS.map((key) => (
                    <Pressable
                        key={key}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: tab === key }}
                        onPress={() => setTab(key)}
                        className={cn(
                            "min-h-10 justify-center rounded-full border px-4",
                            tab === key ? "border-primary bg-primary" : "border-border-clr bg-white",
                        )}>
                        <Text className={cn("font-jakarta-semibold text-xs", tab === key ? "text-white" : "text-text-secondary")}>
                            {t(`typesPlural.${key}`)}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View className="flex-row items-center gap-2 px-4 pt-3">
                <View className="flex-1">
                    <Input
                        icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                        placeholder={t("list.search", { count: shown.length })}
                        value={q}
                        onChangeText={setQ}
                        autoCorrect={false}
                    />
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("list.filtersA11y")}
                    onPress={() => setFilterOpen(true)}
                    className="h-12 w-12 items-center justify-center rounded-brand-8 border border-border-clr bg-white active:bg-page-bg">
                    <SymbolView
                        name={{ ios: "slider.horizontal.3", android: "tune", web: "tune" }}
                        size={18}
                        tintColor={colors["text-secondary"]}
                    />
                    {filterActive ? <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" /> : null}
                </Pressable>
            </View>

            <FlatList
                data={shown}
                keyExtractor={(r) => r.party.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 96 }}
                ListHeaderComponent={
                    <BalanceOverview
                        get={get}
                        give={give}
                        getCount={getCount}
                        giveCount={giveCount}
                        hidden={hidden}
                        onToggleHidden={() => setHidden((h) => !h)}
                    />
                }
                ListEmptyComponent={
                    <Text className="p-8 text-center font-jakarta text-sm text-text-secondary-muted">
                        {parties.length === 0 ? t("list.empty") : t("list.noMatch")}
                    </Text>
                }
                renderItem={({ item }) => (
                    <PartyRow
                        party={item.party}
                        balance={item.balance}
                        lastLabel={item.last ? entryDateTime(item.last) : t("list.noEntries")}
                        hidden={hidden}
                        onPress={() => router.push(partyHref(item.party))}
                        onMenu={() => openMenu(item)}
                    />
                )}
            />

            <Pressable
                accessibilityRole="button"
                onPress={() => { setEditing(null); setFormOpen(true); }}
                className="absolute bottom-4 right-4 min-h-12 flex-row items-center gap-2 rounded-full bg-primary px-5 shadow-lg shadow-black/20 active:opacity-80">
                <SymbolView name={{ ios: "plus", android: "add", web: "add" }} size={18} tintColor="#FFFFFF" />
                <Text className="font-jakarta-bold text-sm text-white">{t("list.add")}</Text>
            </Pressable>

            <PartyFormSheet
                visible={formOpen}
                party={editing ?? undefined}
                defaultType={tab === "all" ? "customer" : tab}
                onClose={closeForm}
                onSaved={handleSaved}
            />
            <BulkPartySheet
                visible={bulkOpen}
                existing={parties}
                defaultType={tab === "all" ? "customer" : tab}
                onClose={() => setBulkOpen(false)}
                onImport={addParties}
            />
            <PartyFilterSheet
                visible={filterOpen}
                balanceFilter={balanceFilter}
                sortBy={sortBy}
                onBalanceChange={setBalanceFilter}
                onSortChange={setSortBy}
                onReset={() => { setBalanceFilter("all"); setSortBy("recent"); }}
                onClose={() => setFilterOpen(false)}
            />
        </View>
    );
}