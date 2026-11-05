// nativeApp\src\lib\date-format.ts

import i18n from "@/i18n";

const p2 = (n: number) => String(n).padStart(2, "0");

// Local-time helpers. toISOString() is UTC and returns "yesterday" after midnight in Pakistan.
export const localDate = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const localTime = (d = new Date()) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;

type Stamped = { date: string; time?: string; createdAt?: string };

export const entryTime = (e: Stamped) => e.time ?? (e.createdAt ? localTime(new Date(e.createdAt)) : "");
export const entrySortKey = (e: Stamped) => `${e.date.slice(0, 10)}T${entryTime(e) || "00:00"}`;

// Day and month names follow the app language (common:date). Components that show these
// dates call useTranslation(), so they re-render when the language changes.
const dayName = (d: Date) => i18n.t("date.days", { returnObjects: true })[d.getDay()];
export const monthName = (d: Date) => i18n.t("date.months", { returnObjects: true })[d.getMonth()];

// "Wed, 07 Oct 26 · 09:34 PM"
export function formatDateTime(date: string, time?: string) {
    const d = new Date(`${date}T${time || "00:00"}:00`);
    if (Number.isNaN(d.getTime())) return date;
    let out = `${dayName(d)}, ${p2(d.getDate())} ${monthName(d)} ${String(d.getFullYear()).slice(2)}`;
    if (time) {
        const h = d.getHours();
        out += ` · ${p2(h % 12 || 12)}:${p2(d.getMinutes())} ${i18n.t(h >= 12 ? "date.pm" : "date.am")}`;
    }
    return out;
}

export const entryDateTime = (e: Stamped) => formatDateTime(e.date.slice(0, 10), entryTime(e) || undefined);
