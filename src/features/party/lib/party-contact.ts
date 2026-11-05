// nativeApp\src\features\party\lib\party-contact.ts

import { Linking, Platform } from "react-native";

import type { IParty } from "@/features/khata/types";
import i18n from "@/i18n";

/** "03001234567" or "+923001234567" -> "923001234567" (wa.me format). */
export const waDigits = (phone?: string) => phone?.replace(/\D/g, "").replace(/^0/, "92");

export function contactBlockReason(party: IParty, balance: number) {
    if (!waDigits(party.phone)) return i18n.t("party:contact.noPhone");
    if (balance === 0) return i18n.t("party:contact.settled");
    return null;
}

export function reminderText(party: IParty, balance: number) {
    const amount = Math.abs(balance).toLocaleString("en-PK");
    // sent in the app language of whoever sends it
    return i18n.t(balance > 0 ? "party:contact.reminderGet" : "party:contact.reminderGive", { name: party.name, amount });
}

export const openWhatsApp = (digits: string, text: string) =>
    Linking.openURL(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`);

export const openSms = (phone: string, text: string) =>
    Linking.openURL(`sms:${phone}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(text)}`);