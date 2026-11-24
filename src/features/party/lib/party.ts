// nativeApp\src\features\party\lib\party.ts

import type { Href } from "expo-router";

import type { IParty } from "@/features/khata/types/types";
import { newId } from "@/lib/id";

export const PARTY_BASE = "/khata/party";

// name + 5-char random suffix: readable, and two "Ali"s never collide
export function makeSlug(name: string) {
    const base =
        name
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 30) || "party";

    return `${base}-${newId().replace(/-/g, "").slice(0, 5)}`;
}

export const partyHref = (p: Pick<IParty, "slug">, sub: "" | "/report" = ""): Href =>
    `${PARTY_BASE}/${p.slug}${sub}` as Href;