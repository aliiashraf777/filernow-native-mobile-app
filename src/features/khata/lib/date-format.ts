// nativeApp\src\lib\date-format.ts

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const p2 = (n: number) => String(n).padStart(2, "0");

// Local-time helpers. toISOString() is UTC and returns "yesterday" after midnight in Pakistan.
export const localDate = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const localTime = (d = new Date()) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;

type Stamped = { date: string; time?: string; createdAt?: string };

export const entryTime = (e: Stamped) => e.time ?? (e.createdAt ? localTime(new Date(e.createdAt)) : "");
export const entrySortKey = (e: Stamped) => `${e.date.slice(0, 10)}T${entryTime(e) || "00:00"}`;

// "Wed, 07 Oct 26 · 09:34 PM"
export function formatDateTime(date: string, time?: string) {
    const d = new Date(`${date}T${time || "00:00"}:00`);
    if (Number.isNaN(d.getTime())) return date;
    let out = `${DAYS[d.getDay()]}, ${p2(d.getDate())} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    if (time) {
        const h = d.getHours();
        out += ` · ${p2(h % 12 || 12)}:${p2(d.getMinutes())} ${h >= 12 ? "PM" : "AM"}`;
    }
    return out;
}

export const entryDateTime = (e: Stamped) => formatDateTime(e.date.slice(0, 10), entryTime(e) || undefined);
