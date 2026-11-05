// nativeApp\src\features\khata\expenseManagerTy.ts

// REPLACED: Swapped vector icons out for Apple SF Symbols support via expo-symbols
import type { SymbolViewProps } from "expo-symbols";

export type TrendDirectionTy = "up" | "down";
export type StatChipVariantTy = "green" | "blue" | "purple" | "red";

export type TrendDirection = TrendDirectionTy;
export type StatChipVariant = StatChipVariantTy;

export interface IExpenseStatItem {
    id: string;
    title: string;
    value: string;          // pre-formatted currency string from backend/formatter
    trendDirection: TrendDirectionTy;
    trendPercent: number;    // e.g. 16, 2, 23, 4, sign is implied by trendDirection
    trendLabel: string;      // "Increase since last month."
    isPositive: boolean;     // whether the trend is good news; independent of arrow direction
    icon: SymbolViewProps["name"]; // REPLACED: Strongly typed SF Symbol literal name string
    chip: StatChipVariantTy;
}

export type EntryKind = "expense" | "income" | "debt";

export interface ICategory {
    id: string;
    label: string;
    kind: EntryKind;
    color: "primary" | "secondary" | "warning" | "info" | "danger" | "neutral";
}

export interface IExpenseEntry {
    id: string;
    cardId?: string;         // persisted so edit/delete can reconcile card balance
    kind: EntryKind;
    subject: string;
    categoryId: string;      // references ICategory.id
    amount: number;
    date: string;            // ISO string
    time?: string;
    description?: string;
    receiptImage?: string;   // base64 / local file URI
    partyId?: string;
    createdAt?: string;      // ISO timestamp, orders same-day entries in ledgers
}

export type SortField = "date" | "amount" | "subject";
export type SortDirection = "asc" | "desc";

export interface ICategoryBreakdownItem {
    category: ICategory;
    amount: number;
    percentOfTotal: number;
}

export interface IExpenseManagerSummary {
    isSetup: boolean;
    balance: number;
    totalIncome: number;
    totalExpenses: number;
    linkedAccountLast4: string;
    asOfLabel: string;
}

export interface ICard {
    id: string;
    label: string;
    balance: number;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    gradient: "primary" | "secondary" | "dark";
}

export type FilterTab = "all" | EntryKind;

export const KHATA_LABELS: Record<EntryKind, {
    title: string;
    verb: string;
    noun: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    categoryHint: string;
    cardLabel?: string;
}> = {
    income: {
        title: "Total Aamdani",
        verb: "Add Aamdani",
        noun: "Aamdani",
        subjectLabel: "Kis se aamdani? (jaise: Salary, Sales)",
        subjectPlaceholder: "Ahmed se payment",
        categoryHint: "jaise: Salary, Sales",
        cardLabel: "Kis card me jama karein (optional)"
    },
    expense: {
        title: "Total Kharcha",
        verb: "Add Kharcha",
        noun: "Kharcha",
        subjectLabel: "Kis cheez ka kharcha? (jaise: Bijli, Grocery)",
        subjectPlaceholder: "Bijli ka bill",
        categoryHint: "jaise: Food, Rent",
        cardLabel: "Kis card se kharcha karein (optional)"
    },
    debt: {
        title: "Total Udhaar",
        verb: "Add Udhaar",
        noun: "Udhaar",
        subjectLabel: "Kis ka udhaar? (jaise: Ali Bhai, Bank Loan)",
        subjectPlaceholder: "Ali Bhai",
        categoryHint: "Udhaar ki qism",
    },
};

export const MAX_CARDS = 3;

export type DebtType = "liya" | "diya" | "liya_wapis_diya" | "diya_wapis_liya" | "liya_maaf" | "diya_maaf";

export const DEBT_TYPE_META: Record<
    DebtType,
    {
        categoryId: string;
        label: string;
        sign: 1 | -1;
        color: ICategory["color"];
    }
> = {
    liya: {
        categoryId: "cat-udhaar-liya",
        label: "Udhaar liya",
        sign: -1,
        color: "danger"
    },
    diya: {
        categoryId: "cat-udhaar-diya",
        label: "Udhaar diya",
        sign: 1,
        color: "info"
    },
    liya_wapis_diya: {
        categoryId: "cat-udhaar-liya-wapis-diya",
        label: "Liya udhaar wapis diya",
        sign: 1,
        color: "warning"
    },
    diya_wapis_liya: {
        categoryId: "cat-udhaar-diya-wapis-liya",
        label: "Diya udhaar wapis liya",
        sign: -1,
        color: "secondary"
    },
    liya_maaf: {
        categoryId: "cat-udhaar-liya-maaf",
        label: "Liya udhaar maaf hua",
        sign: 1,
        color: "neutral"
    },
    diya_maaf: {
        categoryId: "cat-udhaar-diya-maaf",
        label: "Diya udhaar maaf kiya",
        sign: -1,
        color: "neutral"
    },
};

export const DEBT_CATEGORY_TYPE: Record<string, DebtType> = Object.fromEntries(
    (
        Object.entries(DEBT_TYPE_META) as [
            DebtType,
            (typeof DEBT_TYPE_META)[DebtType]
        ][]
    ).map(([t, m]) => [m.categoryId, t])
);

export const PARTY_TYPES = ["customer", "supplier"] as const;

export type PartyType = (typeof PARTY_TYPES)[number];

// Display names live in party:types.<type> (see partyTypeLabel in khata/lib/debt).

export interface IParty {
    id: string;
    slug: string; // used in URLs, e.g. "ali-ashraf-3fa9c"
    name: string;
    phone?: string;
    type: PartyType;
    createdAt: string;
    reminderDate?: string; // YYYY-MM-DD
}

// Labels and hints for each debt type live in party:debtTypes.<type> (translated).

// APPENDED: Clean partial type matching your request configuration parameters
export type NewParty = Pick<IParty, "name" | "phone" | "type">;