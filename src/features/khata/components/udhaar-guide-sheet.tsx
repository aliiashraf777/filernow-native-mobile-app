// nativeApp\src\features\khata\components\udhaar-guide-sheet.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ChipGroup } from "@/components/ui/chip-group";
import { cashFlow, debtLabel, pkr } from "@/features/khata/lib/debt";
import { DEBT_TYPE_META, type DebtType } from "@/features/khata/types/types";
import { cn } from "@/lib/cn";

const AMOUNT = 1000;
const POCKET = 5000;
const TYPES: DebtType[] = ["diya", "liya", "diya_wapis_liya", "liya_wapis_diya", "diya_maaf", "liya_maaf"];

/**
 * Before/after numbers for one story, from the app's real rules.
 * Fresh lend/borrow starts with a clear notebook; every other type settles an existing debt of AMOUNT.
 * Example: "diya_wapis_liya" (sign -1) starts at +1000 (they owed you) and ends at 0.
 */
function scenario(type: DebtType) {
    const { categoryId, sign } = DEBT_TYPE_META[type];
    const fresh = type === "diya" || type === "liya";
    const notebookBefore = fresh ? 0 : -sign * AMOUNT;
    const flow = cashFlow({ kind: "debt", categoryId });
    return {
        pocketBefore: POCKET,
        pocketAfter: POCKET + flow * AMOUNT,
        notebookBefore,
        notebookAfter: notebookBefore + sign * AMOUNT,
    };
}

const tone = (after: number, before: number) =>
    after > before ? "text-success" : after < before ? "text-danger" : "text-text-secondary-muted";

type PanelProps = { title: string; hint: string; before: string; after: string; afterClass: string; note?: string };

function Panel({ title, hint, before, after, afterClass, note }: PanelProps) {
    return (
        <View className="flex-1 rounded-brand-12 border border-border-clr bg-white p-3">
            <Text className="font-jakarta-bold text-xs text-text-dark">{title}</Text>
            <Text className="mb-2 font-jakarta text-[11px] text-text-secondary-muted">{hint}</Text>
            <Text className="font-jakarta text-xs text-text-secondary-muter">{before}</Text>
            <Text className={cn("font-jakarta-extrabold text-base", afterClass)}>→ {after}</Text>
            {note ? <Text className="mt-1 font-jakarta-medium text-[11px] text-text-secondary">{note}</Text> : null}
        </View>
    );
}

type Props = { visible: boolean; onClose: () => void };

export function UdhaarGuideSheet({ visible, onClose }: Props) {
    const { t } = useTranslation("khata", { keyPrefix: "udhaar.guide" });
    const [type, setType] = useState<DebtType>("diya");
    const s = scenario(type);

    const notebookNote = (v: number) => (v > 0 ? t("owesYou") : v < 0 ? t("youOwe") : t("clear"));
    // const notebookClass = (v: number) => (v > 0 ? "text-success" : v < 0 ? "text-danger" : "text-text-secondary-muted");

    return (
        <BottomSheet visible={visible} onClose={onClose} title={t("title")} subtitle={t("subtitle")}>
            <Text className="mb-4 font-jakarta text-sm leading-5 text-text-secondary">{t("intro")}</Text>

            <Text className="mb-2 font-jakarta-bold text-xs text-text-dark">{t("tryIt")}</Text>
            <ChipGroup
                scroll
                options={TYPES.map((k) => ({ value: k, label: debtLabel(DEBT_TYPE_META[k].categoryId) }))}
                value={type}
                onChange={(v) => setType(v as DebtType)}
            />

            <Text className="mb-2 mt-4 font-jakarta text-xs text-text-secondary-muted">{t("example", { amount: pkr(AMOUNT) })}</Text>
            <View className="flex-row gap-3">
                <Panel
                    title={`👛 ${t("pocket")}`}
                    hint={t("pocketHint")}
                    before={`${t("before")}: ${pkr(s.pocketBefore)}`}
                    after={pkr(s.pocketAfter)}
                    afterClass={tone(s.pocketAfter, s.pocketBefore)}
                />
                <Panel
                    title={`📒 ${t("notebook")}`}
                    hint={t("notebookHint")}
                    before={`${t("before")}: ${pkr(Math.abs(s.notebookBefore))}`}
                    after={pkr(Math.abs(s.notebookAfter))}
                    // afterClass={notebookClass(s.notebookAfter)}
                    afterClass="text-text-dark"
                    note={notebookNote(s.notebookAfter)}
                />
            </View>

            <View className="mt-3 rounded-brand-12 bg-page-bg p-3">
                <Text className="font-jakarta-medium text-sm leading-5 text-text-dark">{t(`effect.${type}`)}</Text>
            </View>

            <Text className="mb-2 mt-5 font-jakarta-bold text-xs text-text-dark">{t("rulesTitle")}</Text>
            {(["ruleSign", "ruleCards", "ruleForgive"] as const).map((key, i) => (
                <View key={key} className="mb-2 flex-row gap-2">
                    <Text className="font-jakarta-bold text-xs text-primary">{i + 1}.</Text>
                    <Text className="flex-1 font-jakarta text-xs leading-4 text-text-secondary">{t(key)}</Text>
                </View>
            ))}
        </BottomSheet>
    );
}