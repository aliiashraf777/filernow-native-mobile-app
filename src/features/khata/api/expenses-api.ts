// nativeApp\src\features\khata\api\expenses-api.ts

import { apiRequest } from "@/lib/api/client";

// Server-side Khata (scoped to the token's active business). Shapes follow the OpenAPI schemas.

export type ApiCard = {
    id: number;
    card_number: string; // last 4 digits
    bank_name: string | null;
    balance: string; // decimal as string
    created_at: string;
};

export type ApiCategoryType = "Expense" | "income" | "debt";

export type ApiCategory = { id: number; type: ApiCategoryType; name: string; color: string; is_default: boolean };

export type ApiEntry = {
    id: number;
    expense_type: ApiCategoryType;
    subject: string;
    category: string;
    amount: string;
    entry_date: string;
    account_id: number | null;
    party_id?: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
};

export type NewExpense = {
    subject: string;
    category: string;
    amount: number;
    entry_date: string; // YYYY-MM-DD
    account_id: number; // required by the API for expenses
    party_id?: string;
    description?: string | null;
};

export type NewIncome = Omit<NewExpense, "account_id"> & { account_id?: number | null };

export type NewCard = {
    card_number: string; // exactly 4 digits
    bank_name?: string | null;
    balance?: number; // opening balance, >= 0
    card_color?: "#b51632" | "#4ab898" | "#474f5a";
    expiry_month?: number | null;
    expiry_year?: number | null; // 2000–2100
};

export const expensesApi = {
    /** Income + expense (+ server debt) entries of the active business. */
    transactions: () => apiRequest<ApiEntry[]>("/api/expenses/transactions"),

    /** Returns each card's OPENING balance; the real balance adds its income and subtracts its expenses. */
    cards: () => apiRequest<ApiCard[]>("/api/expenses/cards"),

    createCard: (c: NewCard) => apiRequest<ApiCard>("/api/expenses/cards", { method: "POST", form: c }),

    /** Sets the card's opening balance (must be > 0). */
    setCardBalance: (cardId: number, openingBalance: number) =>
        apiRequest<{ card_id: number; balance: string }>(`/api/expenses/cards/${cardId}/balance`, {
            method: "POST",
            form: { new_balance: openingBalance },
        }),

    transfer: (sourceCardId: number, targetCardId: number, amount: number) =>
        apiRequest<{ card_id: number; balance: string }>("/api/expenses/card/balance/transfer", {
            method: "POST",
            form: { source_card_id: sourceCardId, target_card_id: targetCardId, amount },
        }),

    deleteCategory: (categoryId: number) =>
        apiRequest<unknown>(`/api/expenses/categories/${categoryId}`, { method: "DELETE" }),

    categories: () =>
        apiRequest<{ categories: ApiCategory[]; colors: string[] }>("/api/expenses/feed-expense-categories").then(
            (r) => r.categories,
        ),

    // these two take a form body (x-www-form-urlencoded), not JSON
    createExpense: (e: NewExpense) => apiRequest<ApiEntry>("/api/expenses/expense", { method: "POST", form: e }),

    createIncome: (e: NewIncome) => apiRequest<ApiEntry>("/api/expenses/income", { method: "POST", form: e }),

    /** `color` must be one of the server's ExpenseCategoryColor values. */
    createCategory: (c: { name: string; type: "Expense" | "income"; color: CategoryColor }) =>
        apiRequest<ApiCategory>("/api/expenses/categories", { method: "POST", json: c }),
};

/** The server's ExpenseCategoryColor values. */
export type CategoryColor = "#FF5733" | "#33FF57" | "#3357FF" | "#F1C40F" | "#8E44AD" | "#95A5A6";

/** How a card is shown on screen, e.g. "HBL ••1234" or "Card 1234". */
export const cardLabel = (c: Pick<ApiCard, "bank_name" | "card_number">) =>
    c.bank_name?.trim() ? `${c.bank_name.trim()} ••${c.card_number}` : `Card ${c.card_number}`;
