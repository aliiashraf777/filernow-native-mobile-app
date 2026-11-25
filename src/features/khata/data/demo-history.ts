// nativeApp\src\features\khata\data\demo-history.ts

import { DEBT_TYPE_META, type DebtType, type IExpenseEntry, type IParty } from "@/features/khata/types/types";
import { newId } from "@/lib/id";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => {
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
};

/**
 * Moves every entry by the same number of days so the newest lands on today (spacing is kept).
 * Why: fixed demo dates go stale, and then "this month vs last month" has nothing to compare.
 * Example: newest = 10 Sep, today = 12 Nov -> every entry moves +63 days.
 */
function rebaseDates(entries: IExpenseEntry[]): IExpenseEntry[] {
    if (entries.length === 0) return entries;
    const newest = entries.reduce((max, e) => (e.date.slice(0, 10) > max ? e.date.slice(0, 10) : max), "0000-00-00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const shiftDays = Math.round((today.getTime() - parse(newest).getTime()) / 86_400_000); // round: DST days are 23/25h

    return entries.map((e) => {
        const d = parse(e.date);
        d.setDate(d.getDate() + shiftDays);
        return { ...e, date: ymd(d) + e.date.slice(10) }; // keep any time suffix
    });
}

// Extra udhaar so every Udhaar card has last-month AND this-month activity, whatever today's date is.
const EXTRAS: { party: string; type: DebtType; amount: number; monthsAgo: 0 | 1; day: number }[] = [
    { party: "Hassan Traders", type: "liya", amount: 20000, monthsAgo: 1, day: 6 },
    { party: "Bilal Ahmed", type: "diya", amount: 12000, monthsAgo: 1, day: 12 },
    { party: "Bilal Ahmed", type: "diya_wapis_liya", amount: 7000, monthsAgo: 0, day: 0 }, // day 0 = today
    { party: "Hassan Traders", type: "liya_wapis_diya", amount: 10000, monthsAgo: 0, day: 0 },
];

function extraUdhaar(parties: IParty[]): IExpenseEntry[] {
    const now = new Date();
    return EXTRAS.flatMap((x) => {
        const party = parties.find((p) => p.name === x.party);
        if (!party) return []; // demo party missing: skip instead of crashing
        const when =
            x.monthsAgo === 0
                ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0)
                : new Date(now.getFullYear(), now.getMonth() - 1, x.day, 11, 0);
        const entry: IExpenseEntry = {
            id: newId(),
            kind: "debt",
            subject: party.name,
            partyId: party.id,
            categoryId: DEBT_TYPE_META[x.type].categoryId,
            amount: x.amount,
            date: ymd(when),
            createdAt: when.toISOString(),
        };
        return [entry];
    });
}

export const buildDemoEntries = (base: IExpenseEntry[], parties: IParty[]): IExpenseEntry[] => [
    ...extraUdhaar(parties),
    ...rebaseDates(base),
];