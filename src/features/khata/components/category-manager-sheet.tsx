import { Check, LockKeyhole, Palette, Plus, Tag, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ChipGroup } from "@/components/ui/chip-group";
import { Field, FormButton, Input } from "@/components/ui/form";
import { useBusinessData } from "@/features/khata/hooks/use-business-data";
import { useKhataStore } from "@/features/khata/store/khata-store";
import { type EntryKind, type ICategory } from "@/features/khata/types/types";
import { cn } from "@/lib/cn";

const KINDS: EntryKind[] = ["income", "expense", "debt"];
const COLOR_OPTIONS: ICategory["color"][] = ["primary", "secondary", "warning", "info", "danger", "neutral"];
const SWATCH: Record<ICategory["color"], string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    warning: "bg-warning",
    info: "bg-info",
    danger: "bg-danger",
    neutral: "bg-text-secondary-muter",
};
const COLOR_SURFACE: Record<ICategory["color"], string> = {
    primary: "bg-primary-tint",
    secondary: "bg-success-bg",
    warning: "bg-warning-bg",
    info: "bg-info-bg",
    danger: "bg-danger-bg",
    neutral: "bg-page-bg",
};
const COLOR_ICON: Record<ICategory["color"], string> = {
    primary: "text-primary",
    secondary: "text-secondary",
    warning: "text-warning",
    info: "text-info",
    danger: "text-danger",
    neutral: "text-text-secondary-muted",
};

type Props = { visible: boolean; onClose: () => void };

export function CategoryManagerSheet({ visible, onClose }: Props) {
    const { t } = useTranslation(["khata", "common"]);
    const { categories } = useBusinessData();
    const addCategory = useKhataStore((s) => s.addCategory);
    const deleteCategory = useKhataStore((s) => s.deleteCategory);

    const [tab, setTab] = useState<EntryKind>("expense");
    const [label, setLabel] = useState("");
    const [color, setColor] = useState<ICategory["color"]>("neutral");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<ICategory | null>(null);
    const list = categories.filter((category) => category.kind === tab);

    const saveCategory = async () => {
        setSaving(true);
        try {
            if (await addCategory(label, color, tab)) setLabel("");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <BottomSheet
                visible={visible}
                onClose={onClose}
                title={t("categoryManager.title")}
                subtitle={t("categoryManager.subtitle")}>
                <View className="mb-4">
                    <ChipGroup
                        options={KINDS.map((kind) => ({ value: kind, label: t(`kind.${kind}`) }))}
                        value={tab}
                        onChange={(value) => setTab(value as EntryKind)}
                    />
                </View>

                {tab === "debt" ? (
                    <View className="mb-4 flex-row items-start gap-3 rounded-brand-12 border border-warning/25 bg-warning-bg p-3">
                        <View className="h-9 w-9 items-center justify-center rounded-brand-12 bg-white">
                            <LockKeyhole size={17} className="text-warning" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-jakarta-bold text-xs text-text-dark">{t("categoryManager.fixedTitle")}</Text>
                            <Text className="mt-1 font-jakarta text-xs leading-4 text-text-secondary">
                                {t("categoryManager.fixedDescription")}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View className="mb-4 rounded-brand-12 border border-border-clr bg-page-bg p-3">
                        <View className="mb-3 flex-row items-center gap-2">
                            <View className="h-8 w-8 items-center justify-center rounded-brand-8 bg-white">
                                <Plus size={16} className="text-primary" strokeWidth={2.5} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-jakarta-bold text-xs text-text-dark">{t("categoryManager.createTitle")}</Text>
                                <Text className="mt-0.5 font-jakarta text-[11px] text-text-secondary-muted">
                                    {t("categoryManager.createDescription")}
                                </Text>
                            </View>
                        </View>
                        <Field label={t("categoryManager.nameLabel")}>
                            <Input
                                placeholder={t("categoryManager.namePlaceholder")}
                                value={label}
                                onChangeText={setLabel}
                                autoCorrect={false}
                                returnKeyType="done"
                                onSubmitEditing={() => {
                                    if (label.trim() && !saving) void saveCategory();
                                }}
                            />
                        </Field>
                        <View className="mb-4">
                            <Text className="mb-2 font-jakarta-semibold text-xs text-text-dark">{t("categoryManager.colorLabel")}</Text>
                            <View className="flex-row items-center gap-3">
                                {COLOR_OPTIONS.map((option) => {
                                    const selected = color === option;
                                    return (
                                        <Pressable
                                            key={option}
                                            accessibilityRole="radio"
                                            accessibilityLabel={t(`categoryManager.colors.${option}`)}
                                            accessibilityState={{ checked: selected }}
                                            onPress={() => setColor(option)}
                                            hitSlop={6}
                                            className={cn(
                                                "h-8 w-8 items-center justify-center rounded-full border-2",
                                                selected ? "border-text-dark" : "border-transparent",
                                            )}>
                                            <View className={cn("h-5 w-5 items-center justify-center rounded-full", SWATCH[option])}>
                                                {selected ? (
                                                    <Check
                                                        size={13}
                                                        className={option === "warning" || option === "neutral" ? "text-text-dark" : "text-white"}
                                                        strokeWidth={3}
                                                    />
                                                ) : null}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                        <FormButton
                            label={t(saving ? "categoryManager.saving" : "categoryManager.createButton")}
                            disabled={!label.trim() || saving}
                            onPress={() => void saveCategory()}
                        />
                    </View>
                )}

                <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Tag size={15} className="text-text-secondary" />
                        <Text className="font-jakarta-bold text-xs text-text-dark">{t("categoryManager.listTitle")}</Text>
                    </View>
                    <View className="rounded-full bg-page-bg px-2.5 py-1">
                        <Text className="font-jakarta-semibold text-[10px] text-text-secondary">{list.length}</Text>
                    </View>
                </View>

                {list.length ? (
                    <View className="gap-2">
                        {list.map((category) => {
                            const locked = category.kind === "debt" || category.label === "Other";
                            return (
                                <View
                                    key={category.id}
                                    className="min-h-[60px] flex-row items-center gap-3 rounded-brand-12 border border-border-clr bg-white px-3 py-2">
                                    <View className={cn("h-9 w-9 items-center justify-center rounded-brand-12", COLOR_SURFACE[category.color])}>
                                        <Tag size={16} className={COLOR_ICON[category.color]} />
                                    </View>
                                    <Text numberOfLines={1} className="flex-1 font-jakarta-semibold text-sm text-text-dark">
                                        {category.label}
                                    </Text>
                                    {locked ? (
                                        <View className="flex-row items-center gap-1 rounded-full bg-page-bg px-2 py-1">
                                            <LockKeyhole size={12} className="text-text-secondary-muted" />
                                            <Text className="font-jakarta-medium text-[10px] text-text-secondary-muted">
                                                {t("categoryManager.builtIn")}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={t("categoryManager.deleteA11y", { name: category.label })}
                                            onPress={() => setDeleting(category)}
                                            hitSlop={8}
                                            className="h-9 w-9 items-center justify-center rounded-brand-8 bg-danger-bg active:opacity-70">
                                            <Trash2 size={16} className="text-danger" />
                                        </Pressable>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View className="items-center rounded-brand-12 border border-dashed border-border-clr bg-white px-4 py-6">
                        <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-page-bg">
                            <Palette size={17} className="text-text-secondary-muted" />
                        </View>
                        <Text className="font-jakarta-medium text-xs text-text-secondary-muted">
                            {t("categoryManager.empty")}
                        </Text>
                    </View>
                )}
            </BottomSheet>

            <ConfirmModal
                visible={deleting !== null}
                title={t("categoryManager.deleteTitle")}
                message={t("categoryManager.deleteMessage", { name: deleting?.label ?? "" })}
                cancelLabel={t("common:actions.cancel")}
                confirmLabel={t("common:actions.delete")}
                destructive
                onCancel={() => setDeleting(null)}
                onConfirm={() => {
                    if (deleting) void deleteCategory(deleting.id);
                }}
            />
        </>
    );
}
