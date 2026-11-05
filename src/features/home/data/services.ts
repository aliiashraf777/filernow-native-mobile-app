// nativeApp\src\features\home\data\services.ts

import type { Href } from "expo-router";
import { BriefcaseBusiness, CalendarDays, HandCoins, Trash2, type LucideIcon } from "lucide-react-native";

import type { ServiceIconName } from "@/constants/service-icons";
import type { Resources } from "@/i18n/resources";

export type ServiceLabelKey = keyof Resources["home"]["services"];

/** A grid tile with an illustrated icon. No href → the tile shows a "coming soon" toast. */
export type ServiceItem = {
    id: string;
    /** Key under home:services. */
    labelKey: ServiceLabelKey;
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
    { id: "party", labelKey: "party", icon: "expenses", href: "/khata/party" },
    { id: "cash", labelKey: "cash", icon: "budget" },
    { id: "stock", labelKey: "stock", icon: "reports" },
    { id: "bills", labelKey: "bills", icon: "receipts" },
    { id: "staff", labelKey: "staff", icon: "savings" },
    { id: "expense", labelKey: "expense", icon: "categories" },
];

export const ADVANCE_SERVICES: ServiceItem[] = [
    { id: "ai-assistant", labelKey: "aiAssistant", icon: "aiChat" },
    { id: "scan-receipt", labelKey: "scanReceipt", icon: "scanReceipt" },
    { id: "recurring", labelKey: "recurring", icon: "recurring" },
    { id: "multi-currency", labelKey: "multiCurrency", icon: "multiCurrency" },
    { id: "export-pdf", labelKey: "exportPdf", icon: "exportPdf" },
    { id: "team-sharing", labelKey: "teamSharing", icon: "teamSharing" },
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
