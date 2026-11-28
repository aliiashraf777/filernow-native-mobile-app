// nativeApp\src\features\khata\lib\server-mapping.ts

import type { ApiCard, ApiCategory, ApiEntry, CategoryColor } from "@/features/khata/api/expenses-api";
import type { ICard, ICategory, IExpenseEntry } from "@/features/khata/types/types";

// Server data → the app's Khata types, so screens keep working unchanged.

/** App colour tokens ↔ the server's ExpenseCategoryColor values. */
const COLOR_TO_HEX: Record<ICategory["color"], CategoryColor> = {
    danger: "#FF5733",
    secondary: "#33FF57",
    info: "#3357FF",
    warning: "#F1C40F",
    primary: "#8E44AD",
    neutral: "#95A5A6",
};
const HEX_TO_COLOR = Object.fromEntries(Object.entries(COLOR_TO_HEX).map(([k, v]) => [v.toLowerCase(), k])) as Record<
    string,
    ICategory["color"]
>;

export const categoryHex = (color: ICategory["color"]): CategoryColor => COLOR_TO_HEX[color];

/** Card colours the server accepts, in the app's gradient order. */
export const CARD_COLOR: Record<ICard["gradient"], "#b51632" | "#4ab898" | "#474f5a"> = {
    primary: "#b51632",
    secondary: "#4ab898",
    dark: "#474f5a",
};

const KIND_OF: Record<string, ICategory["kind"] | undefined> = { Expense: "expense", income: "income" };
export const apiTypeOf = (kind: "expense" | "income") => (kind === "expense" ? "Expense" : "income");

export const toCategory = (c: ApiCategory): ICategory | null => {
    const kind = KIND_OF[c.type];
    if (!kind) return null; // server debt categories: Udhaar uses the app's own debt types
    return { id: String(c.id), label: c.name, kind, color: HEX_TO_COLOR[c.color?.toLowerCase()] ?? "neutral" };
};

/** Entries refer to categories by name; this builds the lookup and adds any name we don't know. */
export function linkCategories(categories: ICategory[], entries: ApiEntry[]) {
    const byKey = new Map(categories.map((c) => [`${c.kind}:${c.label.toLowerCase()}`, c]));
    const extra: ICategory[] = [];
    for (const e of entries) {
        const kind = KIND_OF[e.expense_type];
        if (!kind) continue;
        const key = `${kind}:${e.category.toLowerCase()}`;
        if (!byKey.has(key)) {
            // e.g. a category deleted after the entry was made: still show its name
            const synthetic: ICategory = { id: `name:${key}`, label: e.category, kind, color: "neutral" };
            byKey.set(key, synthetic);
            extra.push(synthetic);
        }
    }
    return { all: [...categories, ...extra], idFor: (kind: string, name: string) => byKey.get(`${kind}:${name.toLowerCase()}`)?.id };
}

export const SERVER_ENTRY_PREFIX = "srv-";

/** Income/expense rows sync party IDs; Udhaar entries still stay in the app's local party ledger. */
export function toEntry(e: ApiEntry, categoryId: string): IExpenseEntry | null {
    const kind = KIND_OF[e.expense_type];
    if (kind !== "expense" && kind !== "income") return null;
    return {
        id: `${SERVER_ENTRY_PREFIX}${e.id}`,
        remote: true,
        kind,
        subject: e.subject,
        categoryId,
        amount: Number(e.amount),
        date: e.entry_date,
        cardId: e.account_id != null ? String(e.account_id) : undefined,
        partyId: e.party_id ?? undefined,
        description: e.description ?? undefined,
        createdAt: e.created_at,
    };
}

/** Same formula as the server's card balance: opening balance + income − expenses on that card. */
export function cardTxnSum(cardId: string, entries: IExpenseEntry[]) {
    return entries.reduce(
        (sum, e) => (e.cardId !== cardId ? sum : e.kind === "income" ? sum + e.amount : e.kind === "expense" ? sum - e.amount : sum),
        0,
    );
}

export type CardMeta = Partial<Pick<ICard, "expiryMonth" | "expiryYear" | "gradient">>;

const GRADIENTS: ICard["gradient"][] = ["primary", "secondary", "dark"];

/** The server doesn't return expiry or colour, so those come from what this phone saved (if anything). */
export function toCard(c: ApiCard, index: number, entries: IExpenseEntry[], meta: CardMeta | undefined): ICard {
    const id = String(c.id);
    return {
        id,
        label: c.bank_name?.trim() || `Card ${c.card_number}`,
        last4: c.card_number,
        balance: Number(c.balance) + cardTxnSum(id, entries),
        expiryMonth: meta?.expiryMonth,
        expiryYear: meta?.expiryYear,
        gradient: meta?.gradient ?? GRADIENTS[index % GRADIENTS.length],
    };
}
