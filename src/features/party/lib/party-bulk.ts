// nativeApp\src\features\party\lib\party-bulk.ts

import { type IParty, PARTY_TYPES, type PartyType } from "@/features/khata/types";

export type BulkRow = {
    line: number;
    name: string;
    phone?: string;
    type?: PartyType;
    status: "ok" | "duplicate" | "error";
    /** Key under party:bulk. */
    message?: "errName" | "errPhone" | "errDuplicate";
};

const PHONE_RE = /^(\+92|0)3\d{9}$/;

// Handles Excel dropping the leading 0 ("3001234567") and "92300..." formats
export function normalizePhone(raw: string) {
    let p = raw.replace(/[\s\-()]/g, "");
    if (/^92\d{10}$/.test(p)) p = `+${p}`;
    else if (/^3\d{9}$/.test(p)) p = `0${p}`;
    return p;
}

export function parseBulkParties(text: string, existing: IParty[]): BulkRow[] {
    const names = new Set(existing.map((p) => p.name.trim().toLowerCase()));
    const phones = new Set(existing.map((p) => p.phone).filter(Boolean) as string[]);
    const out: BulkRow[] = [];
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(/[,\t;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
        if (i === 0 && /^(name|naam|party)/i.test(cols[0])) continue; // header row

        const name = cols[0] ?? "";
        const phone = cols[1] ? normalizePhone(cols[1]) : undefined;
        const typeRaw = (cols[2] ?? "").toLowerCase();
        const type = (PARTY_TYPES as readonly string[]).includes(typeRaw) ? (typeRaw as PartyType) : undefined;
        const base = { line: i + 1, name, phone, type };

        if (name.length < 2) { out.push({ ...base, status: "error", message: "errName" }); continue; }
        if (phone && !PHONE_RE.test(phone)) { out.push({ ...base, status: "error", message: "errPhone" }); continue; }

        const key = name.toLowerCase();
        const dup = phone ? phones.has(phone) : names.has(key);
        if (dup) { out.push({ ...base, status: "duplicate", message: "errDuplicate" }); continue; }

        names.add(key);
        if (phone) phones.add(phone);
        out.push({ ...base, status: "ok" });
    }
    return out.slice(0, 500); // safety cap
}