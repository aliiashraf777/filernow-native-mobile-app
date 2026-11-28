import { ChevronRight, Download, FileSpreadsheet, FileText, FolderOpen, Share2, Table2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { DeliverMode } from "@/features/khata/lib/export-file";
import {
    type TransactionsExport,
    exportTransactionsCsv,
    exportTransactionsPdf,
    exportTransactionsXlsx,
} from "@/features/khata/lib/export-transactions-data";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

type Kind = "pdf" | "xlsx" | "csv";

const FORMATS = [
    { value: "pdf", label: "PDF", hintKey: "pdfHint", icon: FileText },
    { value: "xlsx", label: "Excel", hintKey: "xlsxHint", icon: FileSpreadsheet },
    { value: "csv", label: "CSV", hintKey: "csvHint", icon: Table2 },
] as const;
const RUN = { pdf: exportTransactionsPdf, xlsx: exportTransactionsXlsx, csv: exportTransactionsCsv };

const afterClose = (fn: () => void) => setTimeout(fn, 350);

type Props = {
    visible: boolean;
    onClose: () => void;
    title: string;
    baseName: string;
    count: number;
    emptyMessage: string;
    buildInput: () => TransactionsExport;
};

export function ExportFlow({ visible, onClose, title, baseName, count, emptyMessage, buildInput }: Props) {
    const { t } = useTranslation("khata", { keyPrefix: "export" });
    const [kind, setKind] = useState<Kind>("pdf");
    const [exporting, setExporting] = useState(false);

    const run = async (mode: DeliverMode) => {
        if (count === 0 || exporting) return;
        setExporting(true);
        try {
            const result = await RUN[kind](buildInput(), `${baseName}.${kind}`, mode);
            if (result === "saved") toast.success(t("saved"));
        } catch (e) {
            console.warn("export failed", e);
            toast.error(t("failed"));
        } finally {
            setExporting(false);
        }
    };

    const deliver = (mode: DeliverMode) => {
        if (count === 0) {
            toast(emptyMessage);
            return;
        }
        onClose();
        afterClose(() => void run(mode));
    };

    const actions = [
        { mode: "save", label: t("save"), hint: t("saveHint"), icon: Download },
        { mode: "share", label: t("share"), hint: t("shareHint"), icon: Share2 },
        { mode: "save-new", label: t("changeFolder"), hint: t("changeFolderHint"), icon: FolderOpen },
    ] as const;

    return (
        <BottomSheet visible={visible} onClose={onClose} title={title} subtitle={t("subtitle")}>
            <Text className="mb-2 font-jakarta-bold text-xs text-text-dark">{t("formatLabel")}</Text>
            <View className="mb-4 flex-row gap-2">
                {FORMATS.map(({ value, label, hintKey, icon: Icon }) => {
                    const selected = kind === value;
                    return (
                        <Pressable
                            key={value}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selected }}
                            onPress={() => setKind(value)}
                            className={cn(
                                "min-h-[68px] flex-1 items-center justify-center rounded-brand-12 border px-2 py-2",
                                selected ? "border-primary bg-primary-tint" : "border-border-clr bg-white active:bg-page-bg",
                            )}>
                            <Icon size={18} className={selected ? "text-primary" : "text-text-secondary"} />
                            <Text className={cn("mt-1 font-jakarta-bold text-xs", selected ? "text-primary" : "text-text-dark")}>
                                {label}
                            </Text>
                            <Text numberOfLines={1} className="mt-0.5 font-jakarta text-[9px] text-text-secondary-muted">
                                {t(hintKey)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {count > 0 ? (
                <View className="mb-4 flex-row items-center gap-3 rounded-brand-12 border border-border-clr bg-page-bg px-3 py-2.5">
                    <View className="h-9 w-9 items-center justify-center rounded-brand-12 bg-white">
                        <FileSpreadsheet size={17} className="text-primary" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-jakarta-semibold text-xs text-text-dark">
                            {t("entryCount", { count })}
                        </Text>
                        <Text numberOfLines={1} className="mt-0.5 font-jakarta text-[10px] text-text-secondary-muted">
                            {baseName}.{kind}
                        </Text>
                    </View>
                </View>
            ) : (
                <View className="mb-4 rounded-brand-12 border border-warning/25 bg-warning-bg px-3 py-2.5">
                    <Text className="font-jakarta-medium text-xs text-text-secondary">{emptyMessage}</Text>
                </View>
            )}

            <Text className="mb-2 font-jakarta-bold text-xs text-text-dark">{t("deliveryLabel")}</Text>
            <View className="gap-2">
                {actions.map(({ mode, label, hint, icon: Icon }) => (
                    <Pressable
                        key={mode}
                        accessibilityRole="button"
                        disabled={count === 0 || exporting}
                        onPress={() => deliver(mode)}
                        className={cn(
                            "min-h-[60px] flex-row items-center gap-3 rounded-brand-12 border border-border-clr bg-white px-3 py-2 active:bg-page-bg",
                            (count === 0 || exporting) && "opacity-45",
                        )}>
                        <View className="h-9 w-9 items-center justify-center rounded-brand-12 bg-primary-tint">
                            <Icon size={17} className="text-primary" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-jakarta-semibold text-xs text-text-dark">{label}</Text>
                            <Text className="mt-0.5 font-jakarta text-[10px] leading-4 text-text-secondary-muted">{hint}</Text>
                        </View>
                        <ChevronRight size={16} className="text-text-secondary-muter" />
                    </Pressable>
                ))}
            </View>
        </BottomSheet>
    );
}
