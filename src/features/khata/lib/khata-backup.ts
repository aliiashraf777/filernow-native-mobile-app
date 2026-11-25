// nativeApp\src\features\khata\lib\khata-backup.ts

// It validates strictly and copies only known fields, so a bad or tampered file can't poison the store.

import { DEBT_CATEGORY_TYPE, PARTY_TYPES, type IExpenseEntry, type IParty } from "@/features/khata/types/types";

const APP = "filernow-khata-backup";
const VERSION = 1;

export type KhataBackup = { app: typeof APP; version: number; exportedAt: string; entries: IExpenseEntry[]; parties: IParty[] };

export const buildBackup = (entries: IExpenseEntry[], parties: IParty[]): KhataBackup => ({
    app: APP,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    entries,
    parties,
});

const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const optStr = (v: unknown) => (typeof v === "string" ? v : undefined);

function cleanEntry(raw: unknown): IExpenseEntry | null {
    if (typeof raw !== "object" || raw === null) return null;
    const e = raw as Record<string, unknown>;
    if (!str(e.id) || !str(e.subject) || !str(e.date) || !str(e.categoryId)) return null;
    // only Udhaar lives in the phone notebook, and only known Udhaar types are valid
    if (e.kind !== "debt" || !(e.categoryId in DEBT_CATEGORY_TYPE)) return null;
    if (typeof e.amount !== "number" || !Number.isFinite(e.amount) || e.amount <= 0) return null;
    return {
        id: e.id,
        kind: "debt",
        subject: e.subject,
        categoryId: e.categoryId,
        amount: e.amount,
        date: e.date,
        time: optStr(e.time),
        description: optStr(e.description),
        partyId: optStr(e.partyId),
        createdAt: optStr(e.createdAt),
    };
}

function cleanParty(raw: unknown): IParty | null {
    if (typeof raw !== "object" || raw === null) return null;
    const p = raw as Record<string, unknown>;
    if (!str(p.id) || !str(p.name) || !str(p.createdAt)) return null;
    if (!(PARTY_TYPES as readonly string[]).includes(p.type as string)) return null;
    return {
        id: p.id,
        slug: str(p.slug) ? p.slug : p.id,
        name: p.name,
        phone: optStr(p.phone),
        type: p.type as IParty["type"],
        createdAt: p.createdAt,
        reminderDate: optStr(p.reminderDate),
    };
}

/** Returns the cleaned backup, or null when the text is not a Khata backup. Bad rows are skipped, not trusted. */
export function parseBackup(text: string): Pick<KhataBackup, "entries" | "parties"> | null {
    try {
        const raw = JSON.parse(text) as Record<string, unknown>;
        if (raw?.app !== APP || typeof raw.version !== "number" || raw.version > VERSION) return null;
        if (!Array.isArray(raw.entries) || !Array.isArray(raw.parties)) return null;
        return {
            entries: raw.entries.map(cleanEntry).filter((e): e is IExpenseEntry => e !== null),
            parties: raw.parties.map(cleanParty).filter((p): p is IParty => p !== null),
        };
    } catch {
        return null;
    }
}