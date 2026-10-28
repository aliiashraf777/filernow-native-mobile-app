// nativeApp\src\features\khata\hook\use-business-data.ts

import { useBusinessStore } from "@/features/business/store/business-store";
import { type BusinessData, EMPTY_BUSINESS_DATA, useKhataStore } from "@/features/khata/store/khata-store";

/** Entries, parties, cards and data mode of the ACTIVE business. Re-renders when it switches. */
export function useBusinessData(): BusinessData {
    const businessId = useBusinessStore((s) => s.activeId);
    return useKhataStore((s) => s.data[businessId] ?? EMPTY_BUSINESS_DATA);
}