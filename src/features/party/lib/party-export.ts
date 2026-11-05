// nativeApp\src\features\party\lib\party-export.ts

import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

import { type LedgerRow, debtLabel, partyTypeLabel, pkr } from "@/features/khata/lib/debt";
import type { IParty } from "@/features/khata/types";
import i18n from "@/i18n";
import { getAppLanguage, isAppLanguage } from "@/i18n/languages";
import { formatDateTime, localDate } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

export type Range = { from?: string; to?: string };
export type ExportInput = { party: IParty; rows: LedgerRow[]; net: number; range: Range };

// Statements are written in the app language at the time of export.
const x = i18n.getFixedT(null, "party", "export");
const isRtl = () => isAppLanguage(i18n.language) && getAppLanguage(i18n.language).rtl;
const head = (balanceKey: "balance" | "balanceSigned") => [x("date"), x("details"), x("gave"), x("got"), x(balanceKey)];

const details = (r: LedgerRow) => [debtLabel(r.entry.categoryId), r.entry.description].filter(Boolean).join(" — ");
const balLabel = (b: number) => (b === 0 ? "Rs 0" : `${pkr(Math.abs(b))} ${b > 0 ? x("get") : x("give")}`);
const rangeText = ({ from, to }: Range) =>
    from || to ? x("range", { from: from || x("start"), to: to || x("today") }) : x("allDates");
const totals = (rows: LedgerRow[]) => ({
    gave: rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0),
    got: rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0),
});
const cell = (r: LedgerRow, side: 1 | -1) => (r.sign === side ? r.entry.amount : "");

/* ------------------------------ CSV ------------------------------ */
const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function csvText({ rows, net }: ExportInput) {
    const { gave, got } = totals(rows);
    const lines = [
        head("balance"),
        ...rows.map((r) => [r.entry.date, details(r), cell(r, 1), cell(r, -1), r.balance]),
        ["", x("total"), gave, got, net],
    ].map((r) => r.map(q).join(","));
    return "\uFEFF" + lines.join("\n"); // BOM so Excel reads UTF-8
}

/* ------------------------------ XLSX ------------------------------ */
function xlsxBytes({ party, rows, net, range }: ExportInput) {
    const { gave, got } = totals(rows);
    const ws = XLSX.utils.aoa_to_sheet([
        [x("statement", { name: party.name })],
        [x("type"), partyTypeLabel(party.type)],
        [x("phone"), party.phone ?? ""],
        [x("period"), rangeText(range)],
        [],
        head("balanceSigned"),
        ...rows.map((r) => [r.entry.date, details(r), cell(r, 1), cell(r, -1), r.balance]),
        [],
        ["", x("total"), gave, got, net],
    ]);
    ws["!cols"] = [{ wch: 12 }, { wch: 42 }, { wch: 14 }, { wch: 14 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    if (isRtl()) ws["!views"] = [{ RTL: true }];
    XLSX.utils.book_append_sheet(wb, ws, x("sheet"));
    return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}

/* ------------------------------ PDF (HTML -> expo-print) ------------------------------ */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pdfHtml({ party, rows, net, range }: ExportInput) {
    const { gave, got } = totals(rows);
    const netLabel = net > 0 ? x("youWillGet") : net < 0 ? x("youWillGive") : x("settled");
    const netColor = net > 0 ? colors.primary : net < 0 ? colors.success : colors["text-dark"];
    const today = formatDateTime(localDate());
    const dir = isRtl() ? "rtl" : "ltr";
    const body = rows
        .map(
            (r) =>
                `<tr><td>${esc(r.entry.date)}</td><td>${esc(details(r))}</td>` +
                `<td class="r gave">${r.sign > 0 ? pkr(r.entry.amount) : ""}</td>` +
                `<td class="r got">${r.sign < 0 ? pkr(r.entry.amount) : ""}</td>` +
                `<td class="r">${balLabel(r.balance)}</td></tr>`,
        )
        .join("");

    return `<html dir="${dir}"><head><meta charset="utf-8"/><style>
body{font-family:Helvetica,Arial,sans-serif;color:${colors["text-dark"]};margin:0;padding:0 28px 28px}
.band{background:${colors.primary};color:#fff;margin:0 -28px 20px;padding:20px 28px;display:flex;justify-content:space-between}
.band h1{margin:0 0 4px;font-size:20px}.band p{margin:0;font-size:11px;opacity:.9}.band .r{text-align:right}
.boxes{display:flex;gap:10px;margin-bottom:18px}
.box{flex:1;border:1px solid ${colors["border-clr"]};border-radius:8px;padding:10px 12px;background:#F9FAFB}
.box small{display:block;font-size:9px;color:#6B7280;letter-spacing:.5px;margin-bottom:6px}.box b{font-size:15px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#1F2937;color:#fff;text-align:start;padding:8px}td{padding:7px 8px;border-bottom:1px solid #EEE}
tr:nth-child(even) td{background:#F9FAFB}.r{text-align:end}th.r{text-align:end}
[dir=rtl] .box small{letter-spacing:0}
.gave{color:${colors.primary};font-weight:bold}.got{color:${colors.success};font-weight:bold}
tfoot td{background:#F3F4F6;font-weight:bold}
.foot{margin-top:18px;font-size:9px;color:#6B7280;text-align:center}
</style></head><body>
<div class="band"><div><h1>${esc(x("statement", { name: party.name }))}</h1>
<p>${partyTypeLabel(party.type)}${party.phone ? " • " + esc(party.phone) : ""} • ${rangeText(range)}</p></div>
<div class="r"><p>${x("brand")}</p><p>${today}</p></div></div>
<div class="boxes">
<div class="box"><small>${x("youGave")}</small><b style="color:${colors.primary}">${pkr(gave)}</b></div>
<div class="box"><small>${x("youGot")}</small><b style="color:${colors.success}">${pkr(got)}</b></div>
<div class="box"><small>${netLabel}</small><b style="color:${netColor}">${pkr(Math.abs(net))}</b></div></div>
<table><thead><tr><th>${x("date")}</th><th>${x("details")}</th><th class="r">${x("gave")}</th><th class="r">${x("got")}</th><th class="r">${x("balance")}</th></tr></thead>
<tbody>${body}</tbody>
<tfoot><tr><td></td><td>${x("total")}</td><td class="r">${pkr(gave)}</td><td class="r">${pkr(got)}</td><td class="r">${balLabel(net)}</td></tr></tfoot></table>
<div class="foot">${x("footer")}</div>
</body></html>`;
}

/* ------------------------------ write + share ------------------------------ */
async function openShare(uri: string, mimeType: string, UTI: string) {
    if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device");
    await Sharing.shareAsync(uri, { mimeType, UTI, dialogTitle: x("shareTitle") });
}

async function writeAndShare(name: string, content: string | Uint8Array, mimeType: string, UTI: string) {
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    await file.write(content);
    await openShare(file.uri, mimeType, UTI);
}

export const exportCsv = (input: ExportInput, name: string) =>
    writeAndShare(name, csvText(input), "text/csv", "public.comma-separated-values-text");

export const exportXlsx = (input: ExportInput, name: string) =>
    writeAndShare(
        name,
        xlsxBytes(input),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "org.openxmlformats.spreadsheetml.sheet",
    );

export async function exportPdf(input: ExportInput, name: string) {
    const { uri } = await Print.printToFileAsync({ html: pdfHtml(input) });
    let shareUri = uri;
    try {
        // give the file a readable name; fall back to the generated one if copying fails
        const named = new File(Paths.cache, name);
        if (named.exists) named.delete();
        new File(uri).copy(named);
        shareUri = named.uri;
    } catch {
        shareUri = uri;
    }
    await openShare(shareUri, "application/pdf", "com.adobe.pdf");
}