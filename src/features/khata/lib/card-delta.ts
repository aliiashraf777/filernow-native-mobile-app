// nativeApp\src\features\khata\lib\card-delta.ts

import { IExpenseEntry } from "../types";

export function cardDelta(e: Pick<IExpenseEntry, "kind" | "amount">): number {
    if (e.kind === "income") return e.amount;
    if (e.kind === "expense") return -e.amount;
    return 0; // debt never touches cards
}