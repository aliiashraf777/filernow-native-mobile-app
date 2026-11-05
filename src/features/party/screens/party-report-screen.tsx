// nativeApp\src\features\party\screens\party-report-screen.tsx

import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useBusinessData } from "@/features/khata/hooks/use-business-data";

type Side = "all" | "gave" | "got";
type ExportKind = "pdf" | "xlsx" | "csv";

// labels: party:report.all, party:ledger.gave / got
const SIDES: Side[] = ["all", "gave", "got"];
const EXPORTS: { key: ExportKind; label: string }[] = [
    { key: "pdf", label: "PDF" },
    { key: "xlsx", label: "Excel" },
    { key: "csv", label: "CSV" },
];

export default function PartyReportScreen() {
    const { t } = useTranslation("party");
    const sideLabel = (side: Side) => (side === "all" ? t("report.all") : t(`ledger.${side}`));
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

    if (!party) return <PlaceholderScreen title={t("notFound")} headerTitle={t("report.headerTitle")} />;

    const gave = rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0);
    const got = rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0);
    const net = all.length ? all[all.length - 1].balance : 0;
    const filtered = Boolean(q || from || to || side !== "all");

    const run = async (kind: ExportKind) => {
        if (!rows.length) return toast(t("report.noEntries"));
        setBusy(kind);
        try {
            const input: ExportInput = { party, rows, net, range: { from, to } };
            const base = `${party.slug}-khata`;
            if (kind === "pdf") await exportPdf(input, `${base}.pdf`);
            else if (kind === "xlsx") await exportXlsx(input, `${base}.xlsx`);
            else await exportCsv(input, `${base}.csv`);
        } catch (e) {
            console.warn("export failed", e);
            toast.error(t("report.exportFailed"));
        } finally {
            setBusy(null);
        }
    };

    return (
        <View className="flex-1 bg-page-bg">
            <Stack.Screen options={{ title: t("report.title", { name: party.name }) }} />

            <FlatList
                data={[...rows].reverse()}
                keyExtractor={(r) => r.entry.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
                ListHeaderComponent={
                    <>
                        <View className="gap-3 p-4">
                            <View className="rounded-brand-12 border border-border-clr bg-white p-3">
                                <Field label={t("report.search")}>
                                    <Input
                                        icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                                        placeholder={t("report.searchPlaceholder")}
                                        value={q}
                                        onChangeText={setQ}
                                        autoCorrect={false}
                                    />
                                </Field>

                                <Text className="mb-1.5 font-jakarta-semibold text-xs text-text-dark">{t("report.which")}</Text>
                                <View className="mb-4 flex-row gap-2">
                                    {SIDES.map((s) => (
                                        <Pressable
                                            key={s}
                                            accessibilityRole="radio"
                                            accessibilityState={{ checked: side === s }}
                                            onPress={() => setSide(s)}
                                            className={cn(
                                                "min-h-10 flex-1 items-center justify-center rounded-full border",
                                                side === s ? "border-primary bg-primary" : "border-border-clr bg-white",
                                            )}>
                                            <Text className={cn("font-jakarta-semibold text-xs", side === s ? "text-white" : "text-text-secondary")}>
                                                {sideLabel(s)}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Field label={t("report.from")}>
                                            <DateTimeField mode="date" value={from} onChange={setFrom} placeholder={t("report.fromPlaceholder")} />
                                        </Field>
                                    </View>
                                    <View className="flex-1">
                                        <Field label={t("report.to")}>
                                            <DateTimeField mode="date" value={to} min={from || undefined} onChange={setTo} placeholder={t("report.toPlaceholder")} />
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
                                        <Text className="font-jakarta-semibold text-xs text-primary">{t("report.reset")}</Text>
                                    </Pressable>
                                ) : null}
                            </View>

                            <PartyBalanceCard balance={net} gave={gave} got={got} count={rows.length} />

                            <View>
                                <Text className="mb-2 font-jakarta-semibold text-xs text-text-secondary-muted">
                                    {t("report.share")}
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
                    <Text className="p-8 text-center font-jakarta text-sm text-text-secondary-muted">{t("report.empty")}</Text>
                }
                renderItem={({ item }) => <LedgerRowItem row={item} />}
            />
        </View>
    );
}