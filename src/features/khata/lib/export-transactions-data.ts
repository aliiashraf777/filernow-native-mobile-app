// nativeApp\src\features\khata\lib\export-transactions-data.ts

import * as XLSX from "xlsx";

import { pkr } from "@/features/khata/lib/debt";
import type { IExpenseEntry } from "@/features/khata/types";
import { entryTime } from "@/lib/date-format";
// import { MIME, shareBytes, sharePdf } from "@/lib/share-file";
import { MIME, shareBytes, sharePdf } from "./share-file";
import { colors } from "@/theme/tokens";

export type TransactionsExport = {
    title: string;
    entries: IExpenseEntry[];
    categoryLabel: (id: string) => string;
    partyName: (id?: string) => string;
    cardLabel: (id?: string) => string;
};

type Row = {
    date: string;
    time: string;
    type: IExpenseEntry["kind"];
    subject: string;
    category: string;
    party: string;
    card: string;
    amount: number;
    note: string;
};

const HEAD = ["Date", "Time", "Type", "Subject", "Category", "Party", "Card", "Amount", "Note"];

const rowsOf = (i: TransactionsExport): Row[] =>
    i.entries.map((e) => ({
        date: e.date.slice(0, 10),
        time: entryTime(e),
        type: e.kind,
        subject: e.subject,
        category: i.categoryLabel(e.categoryId),
        party: i.partyName(e.partyId),
        card: e.kind === "debt" ? "" : i.cardLabel(e.cardId),
        amount: e.amount,
        note: e.description ?? "",
    }));
const asArray = (r: Row) => [r.date, r.time, r.type, r.subject, r.category, r.party, r.card, r.amount, r.note];

function totals(entries: IExpenseEntry[]) {
    const sum = (k: IExpenseEntry["kind"]) => entries.filter((e) => e.kind === k).reduce((s, e) => s + e.amount, 0);
    const income = sum("income");
    const expense = sum("expense");
    return { income, expense, net: income - expense };
}

const summaryRows = (entries: IExpenseEntry[]) => {
    const t = totals(entries);
    return [
        ["", "", "", "Total Income", "", "", "", t.income, ""],
        ["", "", "", "Total Expense", "", "", "", t.expense, ""],
        ["", "", "", "Net (Income - Expense)", "", "", "", t.net, ""],
    ];
};

/* ------------------------------ CSV ------------------------------ */
const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

function csvText(i: TransactionsExport) {
    const lines = [HEAD, ...rowsOf(i).map(asArray), [], ...summaryRows(i.entries)].map((r) => r.map(q).join(","));
    return "\uFEFF" + lines.join("\n"); // BOM so Excel reads UTF-8
}

/* ------------------------------ XLSX ------------------------------ */
function xlsxBytes(i: TransactionsExport) {
    const ws = XLSX.utils.aoa_to_sheet([
        [i.title],
        ["Exported", new Date().toLocaleDateString("en-GB")],
        [],
        HEAD,
        ...rowsOf(i).map(asArray),
        [],
        ...summaryRows(i.entries),
    ]);
    ws["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    return new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}

/* ------------------------------ PDF ------------------------------ */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pdfHtml(i: TransactionsExport) {
    const { income, expense, net } = totals(i.entries);
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const body = rowsOf(i)
        .map((r) => {
            const sign = r.type === "income" ? "+" : "-";
            const cls = r.type === "income" ? "inc" : r.type === "expense" ? "exp" : "";
            return (
                `<tr><td>${esc(r.date)}</td><td>${esc(r.subject)}</td><td style="text-transform:capitalize">${r.type}</td>` +
                `<td>${esc(r.category)}</td><td class="r ${cls}">${sign}${pkr(r.amount)}</td></tr>`
            );
        })
        .join("");

    return `<html><head><meta charset="utf-8"/><style>
body{font-family:Helvetica,Arial,sans-serif;color:${colors["text-dark"]};margin:0;padding:0 28px 28px}
.band{background:${colors.primary};color:#fff;margin:0 -28px 20px;padding:20px 28px;display:flex;justify-content:space-between}
.band h1{margin:0 0 4px;font-size:20px}.band p{margin:0;font-size:11px;opacity:.9}.band .r{text-align:right}
.boxes{display:flex;gap:10px;margin-bottom:18px}
.box{flex:1;border:1px solid ${colors["border-clr"]};border-radius:8px;padding:10px 12px;background:#F9FAFB}
.box small{display:block;font-size:9px;color:#6B7280;letter-spacing:.5px;margin-bottom:6px}.box b{font-size:15px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#1F2937;color:#fff;text-align:left;padding:8px}td{padding:7px 8px;border-bottom:1px solid #EEE}
tr:nth-child(even) td{background:#F9FAFB}.r{text-align:right}th.r{text-align:right}
.inc{color:${colors.success};font-weight:bold}.exp{color:${colors.danger};font-weight:bold}
.foot{margin-top:18px;font-size:9px;color:#6B7280;text-align:center}
</style></head><body>
<div class="band"><div><h1>${esc(i.title)}</h1><p>${i.entries.length} transactions</p></div>
<div class="r"><p>FilerNow Digital Khata</p><p>${today}</p></div></div>
<div class="boxes">
<div class="box"><small>TOTAL INCOME</small><b style="color:${colors.success}">${pkr(income)}</b></div>
<div class="box"><small>TOTAL EXPENSE</small><b style="color:${colors.danger}">${pkr(expense)}</b></div>
<div class="box"><small>NET</small><b>${net < 0 ? "-" : ""}${pkr(Math.abs(net))}</b></div></div>
<table><thead><tr><th>Date</th><th>Subject</th><th>Type</th><th>Category</th><th class="r">Amount</th></tr></thead>
<tbody>${body}</tbody></table>
<div class="foot">Computer-generated statement • FilerNow Digital Khata</div>
</body></html>`;
}

export const exportTransactionsCsv = (i: TransactionsExport, name: string) => shareBytes(name, csvText(i), MIME.csv);
export const exportTransactionsXlsx = (i: TransactionsExport, name: string) => shareBytes(name, xlsxBytes(i), MIME.xlsx);
export const exportTransactionsPdf = (i: TransactionsExport, name: string) => sharePdf(pdfHtml(i), name);