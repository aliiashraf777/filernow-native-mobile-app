// nativeApp\src\features\business\data\business-options.ts

export type BusinessType = "personal" | "shop" | "freelance" | "household";
export type CurrencyCode = "PKR" | "USD" | "AED" | "SAR" | "GBP" | "EUR";
export type ThemeColor = "red" | "purple" | "green" | "amber" | "blue";

export type IBusiness = {
    id: string;
    name: string;
    type: BusinessType;
    currency: CurrencyCode;
    theme: ThemeColor;
    createdAt: string;
};

// Chip label and switcher caption ("Business · PKR") live in business:types.<type>.
type BusinessTypeOption = {
    /** Background of the rounded icon tile. */
    tint: string;
    /** Emoji glyph; `personal` uses the wallet illustration instead. */
    emoji?: string;
};

// Order = chip order in the form.
export const BUSINESS_TYPES: Record<BusinessType, BusinessTypeOption> = {
    personal: { tint: "#E3F6EE" },
    shop: { tint: "#FFF2DE", emoji: "🏪" },
    freelance: { tint: "#E4EFFF", emoji: "💻" },
    household: { tint: "#FFE5EA", emoji: "🏠" },
};

export const BUSINESS_TYPE_KEYS = Object.keys(BUSINESS_TYPES) as BusinessType[];

// Currency names live in business:currencies.<code>.
export const CURRENCIES: { code: CurrencyCode; symbol: string; color: string; flag: string }[] = [
    { code: "PKR", symbol: "Rs", color: "#16B582", flag: "🇵🇰" },
    { code: "USD", symbol: "$", color: "#2E7BEF", flag: "🇺🇸" },
    { code: "AED", symbol: "Dh", color: "#8B5CF6", flag: "🇦🇪" },
    { code: "SAR", symbol: "SR", color: "#0E9F6E", flag: "🇸🇦" },
    { code: "GBP", symbol: "£", color: "#E0457B", flag: "🇬🇧" },
    { code: "EUR", symbol: "€", color: "#F29B0C", flag: "🇪🇺" },
];

export const currencyOf = (code: CurrencyCode) => CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

/** [light, deep] gradient stops for each theme swatch. */
export const THEME_COLORS: Record<ThemeColor, readonly [string, string]> = {
    red: ["#FF5C70", "#D4123A"],
    purple: ["#A98BFF", "#6A3DE8"],
    green: ["#36D6A8", "#0EA27A"],
    amber: ["#FFCD4D", "#F29B0C"],
    blue: ["#5CB4FF", "#2A6FE0"],
};

export const THEME_COLOR_KEYS = Object.keys(THEME_COLORS) as ThemeColor[];

export const BUSINESS_NAME_MAX = 40;

/** A user can have at most this many businesses in total (including "My Expenses"). */
export const MAX_BUSINESSES = 3;

export const DEFAULT_BUSINESS_ID = "my-expenses";

/** Ids of the old demo businesses (v1 store), dropped on migration. */
export const LEGACY_DEMO_IDS = ["shop-account", "family-budget", "freelance-work"];

export const defaultBusinesses: IBusiness[] = [
    { id: DEFAULT_BUSINESS_ID, name: "My Expenses", type: "personal", currency: "PKR", theme: "red", createdAt: "2026-01-01T00:00:00.000Z" },
];
