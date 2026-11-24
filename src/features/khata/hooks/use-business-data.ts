// nativeApp\src\features\khata\hooks\use-business-data.ts

import { useMemo } from "react";

import { useBusinessStore } from "@/features/business/store/business-store";
import {
    type DataMode,
    type DemoBusinessData,
    EMPTY_DEMO_DATA,
    EMPTY_LOCAL,
    EMPTY_REMOTE,
    type LocalData,
    type RemoteData,
    useKhataStore,
} from "@/features/khata/store/khata-store";
import type { ICard, ICategory, IExpenseEntry, IParty } from "@/features/khata/types/types";

export type BusinessData = { entries: IExpenseEntry[]; parties: IParty[]; cards: ICard[]; categories: ICategory[]; dataMode: DataMode };

/**
 * Where each field comes from:
 *
 * | field      | demo mode           | live mode                                 |
 * |------------|---------------------|-------------------------------------------|
 * | entries    | demo.entries        | server entries + phone Udhaar entries     |
 * | parties    | demo.parties        | phone parties                             |
 * | cards      | demo.cards          | server cards                              |
 * | categories | demo.categories     | server categories + Udhaar types          |
 */
export function composeBusinessData(
    dataMode: DataMode,
    demo: DemoBusinessData,
    local: LocalData,
    remote: RemoteData,
    categories: ICategory[],
): BusinessData {
    if (dataMode === "demo") {
        return { entries: demo.entries, parties: demo.parties, cards: demo.cards, categories: demo.categories, dataMode };
    }
    return { entries: [...remote.entries, ...local.entries], parties: local.parties, cards: remote.cards, categories, dataMode };
}

/** Active business data, or its isolated editable demo copy while demo mode is on. */
export function useBusinessData(): BusinessData {
    const businessId = useBusinessStore((s) => s.activeId);
    const local = useKhataStore((s) => s.data[businessId] ?? EMPTY_LOCAL);
    const remote = useKhataStore((s) => s.remote[businessId] ?? EMPTY_REMOTE);
    const demo = useKhataStore((s) => s.demoData[businessId] ?? EMPTY_DEMO_DATA);
    const categories = useKhataStore((s) => s.categories);
    const dataMode = useKhataStore((s) => s.dataMode[businessId] ?? "blank");
    return useMemo(() => composeBusinessData(dataMode, demo, local, remote, categories), [dataMode, demo, local, remote, categories]);
}