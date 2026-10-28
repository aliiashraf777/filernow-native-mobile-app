// nativeApp\src\features\khata\store\khata-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_BUSINESS_ID } from "@/features/business/data/business-options";
import { useBusinessStore } from "@/features/business/store/business-store";
import { defaultCategories } from "@/features/khata/data/default-categories";
import { dummyCards } from "@/features/khata/data/dummy-cards";
import { dummyExpenseEntries, dummyParties } from "@/features/khata/data/dummy-entries";
import { cardDelta } from "@/features/khata/lib/card-delta";
import {
    type EntryKind,
    type ICard,
    type ICategory,
    type IExpenseEntry,
    type IParty,
    type NewParty,
    MAX_CARDS,
} from "@/features/khata/types";
import { makeSlug } from "@/features/party/lib/party";
import { newId } from "@/lib/id";
import { toast } from "@/lib/toast";

export type DataMode = "demo" | "blank";

/** Everything that belongs to ONE business (maps 1:1 to /businesses/{id}/... in the future API). */
export type BusinessData = {
    entries: IExpenseEntry[];
    parties: IParty[];
    cards: ICard[];
    dataMode: DataMode;
};

export const EMPTY_BUSINESS_DATA: BusinessData = { entries: [], parties: [], cards: [], dataMode: "blank" };

type KhataState = {
    /** Shared default categories. Custom per-business categories arrive in phase 3B. */
    categories: ICategory[];
    /** One slice per business id. */
    data: Record<string, BusinessData>;

    // All actions below work on the ACTIVE business.
    loadDemoData: () => void;
    resetToBlank: () => void;

    addEntry: (entry: Omit<IExpenseEntry, "id">) => void;
    updateEntry: (id: string, patch: Partial<IExpenseEntry>) => void;
    deleteEntry: (id: string) => void;

    addParty: (p: NewParty) => IParty;
    addParties: (list: NewParty[]) => number;
    updateParty: (id: string, patch: Partial<IParty>) => void;
    deleteParty: (id: string, withEntries?: boolean) => boolean;

    addCategory: (label: string, color: ICategory["color"], kind: EntryKind) => void;
    updateCategory: (id: string, patch: Partial<ICategory>) => void;
    deleteCategory: (id: string) => void;

    addCard: (card: Omit<ICard, "id">) => void;
    updateCard: (id: string, patch: Partial<ICard>) => void;
    deleteCard: (id: string) => void;
    adjustCardBalance: (id: string, delta: number) => void;
    transferBetweenCards: (fromId: string, toId: string, amount: number) => void;
};

type Persisted = Pick<KhataState, "categories" | "data">;
type PersistedV1 = {
    entries?: IExpenseEntry[];
    parties?: IParty[];
    cards?: ICard[];
    categories?: ICategory[];
    dataMode?: DataMode;
};

const money = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

// Select primitives or stable references only: useKhataStore((s) => s.categories).
export const useKhataStore = create<KhataState>()(
    persist(
        (set, get) => {
            const activeId = () => useBusinessStore.getState().activeId;
            const current = (): BusinessData => get().data[activeId()] ?? EMPTY_BUSINESS_DATA;
            const update = (patch: Partial<BusinessData> | ((d: BusinessData) => Partial<BusinessData>)) => {
                const id = activeId();
                set((s) => {
                    const cur = s.data[id] ?? EMPTY_BUSINESS_DATA;
                    const next = typeof patch === "function" ? patch(cur) : patch;
                    return { data: { ...s.data, [id]: { ...cur, ...next } } };
                });
            };

            // ONE place that changes card balances + shows the balance toast.
            const applyCardDeltas = (deltas: Record<string, number>) => {
                const touched = Object.entries(deltas).filter(([, d]) => d !== 0);
                if (touched.length === 0) return;

                const before = current().cards;
                update({ cards: before.map((c) => (deltas[c.id] ? { ...c, balance: c.balance + deltas[c.id] } : c)) });

                touched.forEach(([id, d]) => {
                    const card = before.find((c) => c.id === id);
                    if (card) {
                        toast.success(
                            `${card.label}: ${d > 0 ? "+" : "-"}${money(Math.abs(d))} (naya balance ${money(card.balance + d)})`,
                        );
                    }
                });
            };

            return {
                categories: defaultCategories,
                data: {},

                loadDemoData: () => {
                    update({ entries: dummyExpenseEntries, cards: dummyCards, parties: dummyParties, dataMode: "demo" });
                    toast.success("Demo data load ho gaya");
                },

                resetToBlank: () => {
                    update({ entries: [], cards: [], parties: [], dataMode: "blank" });
                    toast.success("Khata saaf ho gaya. Naye sire se shuru karein");
                },

                addEntry: (entry) => {
                    const clean = entry.kind === "debt" ? { ...entry, cardId: undefined } : entry;
                    update((d) => ({
                        entries: [{ ...clean, id: newId(), createdAt: new Date().toISOString() }, ...d.entries],
                    }));
                    toast.success(`${entry.subject} save ho gaya`);
                    if (clean.cardId) applyCardDeltas({ [clean.cardId]: cardDelta(clean) });
                },

                updateEntry: (id, patch) => {
                    const old = current().entries.find((e) => e.id === id);
                    if (!old) return;

                    const updated = { ...old, ...patch };
                    update((d) => ({ entries: d.entries.map((e) => (e.id === id ? updated : e)) }));
                    toast.success(`${updated.subject} update ho gaya`);

                    // Debt card effects are ledger-style (never recomputed on edit).
                    if (updated.kind !== "debt") {
                        const deltas: Record<string, number> = {};
                        if (old.cardId) deltas[old.cardId] = (deltas[old.cardId] ?? 0) - cardDelta(old);
                        if (updated.cardId) deltas[updated.cardId] = (deltas[updated.cardId] ?? 0) + cardDelta(updated);
                        applyCardDeltas(deltas);
                    }
                },

                deleteEntry: (id) => {
                    const target = current().entries.find((e) => e.id === id);
                    if (!target) return;

                    update((d) => ({ entries: d.entries.filter((e) => e.id !== id) }));
                    toast.success(`${target.subject} delete ho gaya`);

                    if (target.cardId && target.kind !== "debt") {
                        applyCardDeltas({ [target.cardId]: -cardDelta(target) });
                    }
                },

                addParty: (p) => {
                    const party: IParty = { ...p, id: newId(), slug: makeSlug(p.name), createdAt: new Date().toISOString() };
                    update((d) => ({ parties: [party, ...d.parties] }));
                    toast.success(`${party.name} add ho gaya`);
                    return party;
                },

                addParties: (list) => {
                    const now = new Date().toISOString();
                    const created: IParty[] = list.map((p) => ({ ...p, id: newId(), slug: makeSlug(p.name), createdAt: now }));
                    update((d) => ({ parties: [...created, ...d.parties] }));
                    toast.success(`${created.length} parties add ho gayin`);
                    return created.length;
                },

                updateParty: (id, patch) =>
                    update((d) => ({ parties: d.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

                deleteParty: (id, withEntries = false) => {
                    const linked = current().entries.filter((e) => e.partyId === id);
                    if (linked.length && !withEntries) {
                        toast.error("Is party ki entries maujood hain, pehle woh delete karein");
                        return false;
                    }
                    if (linked.length) {
                        // undo card effects of linked income/expense entries (debt never touches cards)
                        const deltas: Record<string, number> = {};
                        linked.forEach((e) => {
                            if (e.kind !== "debt" && e.cardId) deltas[e.cardId] = (deltas[e.cardId] ?? 0) - cardDelta(e);
                        });
                        applyCardDeltas(deltas);
                        update((d) => ({ entries: d.entries.filter((e) => e.partyId !== id) }));
                    }
                    update((d) => ({ parties: d.parties.filter((p) => p.id !== id) }));
                    toast.success(linked.length ? `Party aur ${linked.length} entries delete ho gayin` : "Party delete ho gayi");
                    return true;
                },

                addCategory: (label, color, kind) => {
                    const clean = label.trim();
                    if (get().categories.some((c) => c.kind === kind && c.label.toLowerCase() === clean.toLowerCase())) {
                        toast.error(`"${clean}" pehle se maujood hai`);
                        return;
                    }
                    set((s) => ({ categories: [...s.categories, { id: newId(), label: clean, color, kind }] }));
                    toast.success(`${clean} category add ho gayi`);
                },

                updateCategory: (id, patch) =>
                    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

                deleteCategory: (id) => {
                    const { categories } = get();
                    const target = categories.find((c) => c.id === id);
                    if (!target) return;

                    if (target.kind === "debt") {
                        toast.error("Udhaar categories delete nahi ho sakti");
                        return;
                    }
                    const fallback = categories.find((c) => c.kind === target.kind && c.label === "Other" && c.id !== id);
                    if (!fallback) {
                        toast.error(`"Other" category delete nahi ho sakti`);
                        return;
                    }
                    // categories are shared, so re-point entries in EVERY business
                    set((s) => ({
                        categories: s.categories.filter((c) => c.id !== id),
                        data: Object.fromEntries(
                            Object.entries(s.data).map(([businessId, d]) => [
                                businessId,
                                { ...d, entries: d.entries.map((e) => (e.categoryId === id ? { ...e, categoryId: fallback.id } : e)) },
                            ]),
                        ),
                    }));
                    toast.success(`${target.label} delete ho gayi (entries "Other" me chali gayin)`);
                },

                addCard: (card) => {
                    if (current().cards.length >= MAX_CARDS) {
                        toast.error(`Sirf ${MAX_CARDS} cards add ho sakte hain`);
                        return;
                    }
                    update((d) => ({ cards: [...d.cards, { ...card, id: newId() }] }));
                    toast.success(`${card.label} add ho gaya`);
                },

                updateCard: (id, patch) => {
                    update((d) => ({ cards: d.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
                    toast.success("Card update ho gaya");
                },

                deleteCard: (id) => {
                    const target = current().cards.find((c) => c.id === id);
                    update((d) => ({
                        cards: d.cards.filter((c) => c.id !== id),
                        entries: d.entries.map((e) => (e.cardId === id ? { ...e, cardId: undefined } : e)),
                    }));
                    if (target) toast.success(`${target.label} delete ho gaya`);
                },

                adjustCardBalance: (id, delta) =>
                    update((d) => ({ cards: d.cards.map((c) => (c.id === id ? { ...c, balance: c.balance + delta } : c)) })),

                transferBetweenCards: (fromId, toId, amount) => {
                    const { cards } = current();
                    const from = cards.find((c) => c.id === fromId);
                    const to = cards.find((c) => c.id === toId);

                    if (!from || !to || fromId === toId || amount <= 0) {
                        toast.error("Alag alag cards chunein");
                        return;
                    }
                    if (from.balance < amount) {
                        toast.error(`${from.label} me itna balance nahi hai`);
                        return;
                    }
                    update({
                        cards: cards.map((c) =>
                            c.id === fromId ? { ...c, balance: c.balance - amount }
                                : c.id === toId ? { ...c, balance: c.balance + amount }
                                    : c,
                        ),
                    });
                    toast.success(`${money(amount)} ${from.label} se ${to.label} me transfer hue`);
                },
            };
        },
        {
            name: "filernow-khata",
            version: 2,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s): Persisted => ({ categories: s.categories, data: s.data }),
            // v1 kept one global list; move it into the default business so nothing is lost.
            migrate: (persisted, version): Persisted => {
                if (version < 2) {
                    const old = persisted as PersistedV1;
                    return {
                        categories: old.categories ?? defaultCategories,
                        data: {
                            [DEFAULT_BUSINESS_ID]: {
                                entries: old.entries ?? [],
                                parties: old.parties ?? [],
                                cards: old.cards ?? [],
                                dataMode: old.dataMode ?? "blank",
                            },
                        },
                    };
                }
                return persisted as Persisted;
            },
        },
    ),
);