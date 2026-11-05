// nativeApp\src\features\notifications\lib\time-ago.ts

import i18n from "@/i18n";
import { localDate, monthName } from "@/lib/date-format";

/** "Just now", "10 min ago", "2 hours ago", "Yesterday", "3 days ago", then "12 Oct" (in the app language). */
export function timeAgo(iso: string, now = new Date()) {
    const d = new Date(iso);
    const mins = Math.floor((now.getTime() - d.getTime()) / 60_000);
    if (mins < 1) return i18n.t("timeAgo.justNow");
    if (mins < 60) return i18n.t("timeAgo.minutes", { count: mins });

    if (localDate(d) === localDate(now)) return i18n.t("timeAgo.hours", { count: Math.floor(mins / 60) });

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (localDate(d) === localDate(yesterday)) return i18n.t("timeAgo.yesterday");

    const days = Math.max(2, Math.round(mins / (60 * 24)));
    if (days < 7) return i18n.t("timeAgo.days", { count: days });
    return `${d.getDate()} ${monthName(d)}`;
}

export const isToday = (iso: string, now = new Date()) => localDate(new Date(iso)) === localDate(now);
