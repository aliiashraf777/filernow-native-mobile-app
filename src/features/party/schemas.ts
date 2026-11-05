// nativeApp\src\features\party\schemas.ts

import { z } from "zod";

import { PARTY_TYPES } from "@/features/khata/types";

/** Validation messages are keys under party:form, translated where the error is shown. */
export type PartyFormErrorKey = "form.nameError" | "form.phoneError";
const nameError: PartyFormErrorKey = "form.nameError";
const phoneError: PartyFormErrorKey = "form.phoneError";

export const partySchema = z.object({
    name: z.string().trim().min(2, nameError),
    phone: z
        .string()
        .trim()
        .regex(/^(\+92|0)3\d{9}$/, phoneError)
        .or(z.literal(""))
        .optional(),
    type: z.enum(PARTY_TYPES),
});
export type PartyFormValues = z.infer<typeof partySchema>;