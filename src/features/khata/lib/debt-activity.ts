// nativeApp\src\features\khata\lib\debt-activity.ts

import { DEBT_CATEGORY_TYPE, type DebtType, type IExpenseEntry } from "@/features/khata/types";

export type Grain = "day" | "week" | "month";
export type ActivityBucket = { key: string; label: string; gave: number; got: number };

/** How many buckets each grain shows. */
export const GRAINS: Record<Grain, number> = { day: 7, week: 8, month: 6 };

// Only these types move real cash. The two "maaf" (forgiven) types never do, so the chart skips them.
const CASH: Partial<Record<DebtType, "gave" | "got">> = {
    diya: "gave",
    liya_wapis_diya: "gave",
    liya: "got",
    diya_wapis_liya: "got",
};

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Monday of the week that contains "YYYY-MM-DD" (local time, no UTC shifts)
function weekStart(day: string) {
    const [y, m, d] = day.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return ymd(date);
}

const keyOf = (grain: Grain, day: string) => (grain === "month" ? day.slice(0, 7) : grain === "week" ? weekStart(day) : day);

const labelOf = (grain: Grain, key: string) =>
    grain === "month" ? `${key.slice(5, 7)}/${key.slice(2, 4)}` : `${key.slice(8, 10)}/${key.slice(5, 7)}`;

/** The last N consecutive buckets ending now (empty ones included, so the time axis stays honest). */
export function buildDebtActivity(entries: IExpenseEntry[], grain: Grain): ActivityBucket[] {
    const now = new Date();
    const count = GRAINS[grain];
    const buckets = new Map<string, ActivityBucket>();

    for (let i = count - 1; i >= 0; i--) {
        const d =
            grain === "month"
                ? new Date(now.getFullYear(), now.getMonth() - i, 1)
                : new Date(now.getFullYear(), now.getMonth(), now.getDate() - (grain === "week" ? i * 7 : i));
        const key = keyOf(grain, ymd(d));
        buckets.set(key, { key, label: labelOf(grain, key), gave: 0, got: 0 });
    }

    for (const e of entries) {
        if (e.kind !== "debt") continue;
        const dir = CASH[DEBT_CATEGORY_TYPE[e.categoryId]];
        const bucket = dir ? buckets.get(keyOf(grain, e.date.slice(0, 10))) : undefined;
        if (bucket && dir) bucket[dir] += e.amount;
    }
    return [...buckets.values()];
}