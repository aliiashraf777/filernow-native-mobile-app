// nativeApp\src\features\home\data\services.ts

import type { Href } from "expo-router";
import { BriefcaseBusiness, CalendarDays, HandCoins, Trash2, type LucideIcon } from "lucide-react-native";

import type { ServiceIconName } from "@/constants/service-icons";

/** A grid tile with an illustrated icon. No href → the tile shows a "coming soon" toast. */
export type ServiceItem = {
    id: string;
    label: string;
    icon: ServiceIconName;
    href?: Href;
};

/** A shortcut card with a line icon, title and one-line description. */
export type ShortcutItem = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    href?: Href;
};

export const KHATA_SERVICES: ServiceItem[] = [
    // { id: "party", label: "Party", icon: "expenses", href: "/khata/party" },
    { id: "party", label: "Party", icon: "expenses" },
    { id: "cash", label: "Cash", icon: "budget" },
    { id: "stock", label: "Stock", icon: "reports" },
    { id: "bills", label: "Bills", icon: "receipts" },
    { id: "staff", label: "Staff", icon: "savings" },
    { id: "expense", label: "Expense", icon: "categories" },
];

export const ADVANCE_SERVICES: ServiceItem[] = [
    { id: "ai-assistant", label: "AI Assistant", icon: "aiChat" },
    { id: "scan-receipt", label: "Scan Receipt", icon: "scanReceipt" },
    { id: "recurring", label: "Recurring", icon: "recurring" },
    { id: "multi-currency", label: "Multi-Currency", icon: "multiCurrency" },
    { id: "export-pdf", label: "Export PDF", icon: "exportPdf" },
    { id: "team-sharing", label: "Team Sharing", icon: "teamSharing" },
];

export const KHATA_SHORTCUTS: ShortcutItem[] = [
    {
        id: "daily-khata",
        title: "Daily Khata",
        description: "Record your daily sales and spending.",
        icon: CalendarDays,
        href: "/khata/daily",
    },
    {
        id: "business-khata",
        title: "Business Khata",
        description: "Track your business accounts in one place.",
        icon: BriefcaseBusiness,
        href: "/khata/business",
    },
    {
        id: "udhaar-khata",
        title: "Udhar Khata",
        description: "Manage credit given and payments due.",
        icon: HandCoins,
        href: "/khata/udhaar",
    },
    {
        id: "recycle-bin",
        title: "Recycle Bin",
        description: "Restore deleted entries anytime.",
        icon: Trash2,
    },
];
