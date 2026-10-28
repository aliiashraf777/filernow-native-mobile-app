// nativeApp\src\features\party\screens\party-report-screen.tsx

import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

import { DateTimeField } from "@/components/ui/date-time-field";
import { Field, Input } from "@/components/ui/form";
import { PlaceholderScreen } from "@/components/ui/placeholder-screen";
import { buildLedger, debtLabel } from "@/features/khata/lib/debt";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { LedgerHeader, LedgerRowItem } from "@/features/party/components/ledger";
import { PartyBalanceCard } from "@/features/party/components/party-balance-card";
import { type ExportInput, exportCsv, exportPdf, exportXlsx } from "@/features/party/lib/party-export";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import { useBusinessData } from "@/features/khata/hook/use-business-data";

type Side = "all" | "gave" | "got";
type ExportKind = "pdf" | "xlsx" | "csv";

const SIDES: { key: Side; label: string }[] = [
    { key: "all", label: "Sab" },
    { key: "gave", label: "You Gave" },
    { key: "got", label: "You Got" },
];
const EXPORTS: { key: ExportKind; label: string }[] = [
    { key: "pdf", label: "PDF" },
    { key: "xlsx", label: "Excel" },
    { key: "csv", label: "CSV" },
];

export default function PartyReportScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    // const party = useKhataStore((s) => s.parties.find((p) => p.slug === slug || p.id === slug));
    // const entries = useKhataStore((s) => s.entries);
    const { parties, entries } = useBusinessData();
    const party = parties.find((p) => p.slug === slug || p.id === slug);

    const [q, setQ] = useState("");
    const [side, setSide] = useState<Side>("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [busy, setBusy] = useState<ExportKind | null>(null);

    const all = useMemo(() => buildLedger(entries, party?.id ?? ""), [entries, party?.id]);
    const rows = useMemo(() => {
        const k = q.trim().toLowerCase();
        return all.filter((r) => {
            const d = r.entry.date.slice(0, 10);
            return (
                (side === "all" || (side === "gave" ? r.sign > 0 : r.sign < 0)) &&
                (!from || d >= from) &&
                (!to || d <= to) &&
                (!k || `${debtLabel(r.entry.categoryId)} ${r.entry.description ?? ""}`.toLowerCase().includes(k))
            );
        });
    }, [all, side, from, to, q]);

    if (!party) return <PlaceholderScreen title="Party nahi mili" headerTitle="Report" />;

    const gave = rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0);
    const got = rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0);
    const net = all.length ? all[all.length - 1].balance : 0;
    const filtered = Boolean(q || from || to || side !== "all");

    const run = async (kind: ExportKind) => {
        if (!rows.length) return toast("In filters mein koi entry nahi hai");
        setBusy(kind);
        try {
            const input: ExportInput = { party, rows, net, range: { from, to } };
            const base = `${party.slug}-khata`;
            if (kind === "pdf") await exportPdf(input, `${base}.pdf`);
            else if (kind === "xlsx") await exportXlsx(input, `${base}.xlsx`);
            else await exportCsv(input, `${base}.csv`);
        } catch (e) {
            console.warn("export failed", e);
            toast.error("Export nahi ho saka. Dobara koshish karein.");
        } finally {
            setBusy(null);
        }
    };

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen options={{ title: `Report: ${party.name}` }} />

            <FlatList
                data={[...rows].reverse()}
                keyExtractor={(r) => r.entry.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
                ListHeaderComponent={
                    <>
                        <View className="gap-3 p-4">
                            <View className="rounded-brand-12 border border-border-clr bg-white p-3">
                                <Field label="Entry dhoondein">
                                    <Input
                                        icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                                        placeholder="qism ya note likhein"
                                        value={q}
                                        onChangeText={setQ}
                                        autoCorrect={false}
                                    />
                                </Field>

                                <Text className="mb-1.5 font-jakarta-semibold text-xs text-text-dark">Kaun si entries?</Text>
                                <View className="mb-4 flex-row gap-2">
                                    {SIDES.map((s) => (
                                        <Pressable
                                            key={s.key}
                                            accessibilityRole="radio"
                                            accessibilityState={{ checked: side === s.key }}
                                            onPress={() => setSide(s.key)}
                                            className={cn(
                                                "min-h-10 flex-1 items-center justify-center rounded-full border",
                                                side === s.key ? "border-primary bg-primary" : "border-border-clr bg-white",
                                            )}>
                                            <Text className={cn("font-jakarta-semibold text-xs", side === s.key ? "text-white" : "text-text-secondary")}>
                                                {s.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Field label="Shuru ki tareekh">
                                            <DateTimeField mode="date" value={from} onChange={setFrom} placeholder="Shuru" />
                                        </Field>
                                    </View>
                                    <View className="flex-1">
                                        <Field label="Akhri tareekh">
                                            <DateTimeField mode="date" value={to} min={from || undefined} onChange={setTo} placeholder="Akhir" />
                                        </Field>
                                    </View>
                                </View>

                                {filtered ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={() => {
                                            setQ("");
                                            setSide("all");
                                            setFrom("");
                                            setTo("");
                                        }}
                                        className="min-h-9 self-start justify-center">
                                        <Text className="font-jakarta-semibold text-xs text-primary">Filters reset karein</Text>
                                    </Pressable>
                                ) : null}
                            </View>

                            <PartyBalanceCard balance={net} gave={gave} got={got} count={rows.length} />

                            <View>
                                <Text className="mb-2 font-jakarta-semibold text-xs text-text-secondary-muted">
                                    Report share karein (WhatsApp, Drive, Email, ...)
                                </Text>
                                <View className="flex-row gap-2">
                                    {EXPORTS.map((x) => (
                                        <Pressable
                                            key={x.key}
                                            accessibilityRole="button"
                                            disabled={busy !== null}
                                            onPress={() => run(x.key)}
                                            className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-brand-8 border border-primary active:bg-primary-tint"
                                            style={{ opacity: busy && busy !== x.key ? 0.4 : 1 }}>
                                            {busy === x.key ? <ActivityIndicator size="small" /> : null}
                                            <Text className="font-jakarta-semibold text-xs text-primary">{x.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <LedgerHeader count={rows.length} />
                    </>
                }
                ListEmptyComponent={
                    <Text className="p-8 text-center font-jakarta text-sm text-text-secondary-muted">Is filter mein koi entry nahi mili.</Text>
                }
                renderItem={({ item }) => <LedgerRowItem row={item} />}
            />
        </View>
    );
}