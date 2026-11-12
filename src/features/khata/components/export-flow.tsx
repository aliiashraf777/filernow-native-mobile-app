// nativeApp\src\features\khata\components\export-flow.tsx

// It’s shared by Daily and Udhaar: pick format, then Save / Share / Change folder.

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { OptionSheet } from "@/components/ui/option-sheet";
import type { DeliverMode } from "@/features/khata/lib/export-file";
import {
    type TransactionsExport,
    exportTransactionsCsv,
    exportTransactionsPdf,
    exportTransactionsXlsx,
} from "@/features/khata/lib/export-transactions-data";
import { toast } from "@/lib/toast";

type Kind = "pdf" | "xlsx" | "csv";

const FORMATS: { value: Kind; label: string }[] = [
    { value: "pdf", label: "PDF" },
    { value: "xlsx", label: "Excel (.xlsx)" },
    { value: "csv", label: "CSV" },
];
const RUN = { pdf: exportTransactionsPdf, xlsx: exportTransactionsXlsx, csv: exportTransactionsCsv };

// Two native modals can't swap in the same frame on iOS: let the first one finish closing.
const afterClose = (fn: () => void) => setTimeout(fn, 350);

type Props = {
    visible: boolean;
    onClose: () => void;
    /** Title of the format sheet. */
    title: string;
    /** File name without extension, e.g. "daily-khata-2026-11-11". */
    baseName: string;
    /** How many rows would be exported (0 = show emptyMessage instead). */
    count: number;
    emptyMessage: string;
    buildInput: () => TransactionsExport;
};

export function ExportFlow({ visible, onClose, title, baseName, count, emptyMessage, buildInput }: Props) {
    const { t } = useTranslation("khata", { keyPrefix: "export" });
    const [kind, setKind] = useState<Kind | null>(null); // chosen format, waiting for save/share

    const modes: { value: DeliverMode; label: string }[] = [
        { value: "save", label: t("save") },
        { value: "share", label: t("share") },
        { value: "save-new", label: t("changeFolder") },
    ];

    const pickFormat = (k: Kind) => {
        onClose();
        if (count === 0) return toast(emptyMessage);
        afterClose(() => setKind(k));
    };

    const run = async (k: Kind, mode: DeliverMode) => {
        try {
            const result = await RUN[k](buildInput(), `${baseName}.${k}`, mode);
            if (result === "saved") toast.success(t("saved"));
        } catch (e) {
            console.warn("export failed", e);
            toast.error(t("failed"));
        }
    };

    const pickMode = (mode: DeliverMode) => {
        const k = kind;
        setKind(null);
        if (k) afterClose(() => run(k, mode));
    };

    return (
        <>
            <OptionSheet<Kind | "">
                visible={visible}
                title={title}
                options={FORMATS}
                value=""
                onChange={(v) => v && pickFormat(v)}
                onClose={onClose}
            />
            <OptionSheet<DeliverMode | "">
                visible={kind !== null}
                title={t("modeTitle", { format: (kind ?? "").toUpperCase() })}
                options={modes}
                value=""
                onChange={(v) => v && pickMode(v)}
                onClose={() => setKind(null)}
            />
        </>
    );
}