// nativeApp\src\features\khata\data\default-categories.ts

import { DEBT_TYPE_META, EntryKind, ICategory } from "../types";

export const defaultIncomeCategories: ICategory[] = [
    {
        id: "cat-salary",
        label: "Salary",
        kind: "income",
        color: "primary"
    },
    {
        id: "cat-sales",
        label: "Sales",
        kind: "income",
        color: "info"
    },
    {
        id: "cat-business-income",
        label: "Business",
        kind: "income",
        color: "secondary"
    },
    {
        id: "cat-rental-income",
        label: "Rental Income",
        kind: "income",
        color: "neutral"
    },
    {
        id: "cat-other-income",
        label: "Other",
        kind: "income",
        color: "neutral"
    },
];

export const defaultExpenseCategories: ICategory[] = [
    {
        id: "cat-food",
        label: "Food",
        kind: "expense",
        color: "warning"
    },
    {
        id: "cat-transport",
        label: "Transport",
        kind: "expense",
        color: "secondary"
    },
    {
        id: "cat-rent",
        label: "Rent",
        kind: "expense",
        color: "primary"
    },
    {
        id: "cat-utilities",
        label: "Utilities",
        kind: "expense",
        color: "info"
    },
    {
        id: "cat-business-expense",
        label: "Business",
        kind: "expense",
        color: "neutral"
    },
    {
        id: "cat-other-expense",
        label: "Other",
        kind: "expense",
        color: "neutral"
    },
];

export const defaultDebtCategories: ICategory[] = Object.values(DEBT_TYPE_META).map((m) => ({
    id: m.categoryId,
    label: m.label,
    kind: "debt",
    color: m.color,
}));

export const defaultCategories: ICategory[] = [
    ...defaultIncomeCategories,
    ...defaultExpenseCategories,
    ...defaultDebtCategories
];

export function getCategoriesForEntryKind(kind: EntryKind | null | undefined, categories: ICategory[]): ICategory[] {
    if (!kind) {
        return categories;
    }
    return categories.filter((c) => c.kind === kind);
}
