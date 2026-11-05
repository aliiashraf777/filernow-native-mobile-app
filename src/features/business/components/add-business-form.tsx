// nativeApp\src\features\business\components\add-business-form.tsx

import { Check, ChevronDown } from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { GradientFill } from "@/components/ui/gradient-fill";
import {
    BUSINESS_NAME_MAX,
    BUSINESS_TYPE_KEYS,
    CURRENCIES,
    THEME_COLOR_KEYS,
    THEME_COLORS,
    currencyOf,
    type BusinessType,
    type CurrencyCode,
    type ThemeColor,
} from "@/features/business/data/business-options";
import type { NewBusiness } from "@/features/business/store/business-store";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

import { BusinessIcon } from "./business-icon";

const EMPTY: NewBusiness = { name: "", type: "shop", currency: "PKR", theme: "red" };

/** Form state for "Add New Business"; kept outside the fields so the sheet footer can submit it. */
export function useAddBusinessForm() {
    const [values, setValues] = useState<NewBusiness>(EMPTY);
    const set = <K extends keyof NewBusiness>(key: K, value: NewBusiness[K]) =>
        setValues((v) => ({ ...v, [key]: value }));
    const reset = () => setValues(EMPTY);
    const canSubmit = values.name.trim().length > 0;

    return { values, set, reset, canSubmit };
}

export type AddBusinessFormState = ReturnType<typeof useAddBusinessForm>;

function FieldLabel({ children }: { children: ReactNode }) {
    return <Text className="mb-2 ml-1 font-jakarta-medium text-para-base text-[#5F5A5C]">{children}</Text>;
}

function CurrencyBadge({ code }: { code: CurrencyCode }) {
    const c = currencyOf(code);
    return (
        <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: c.color }}>
            <Text allowFontScaling={false} className="font-jakarta-bold text-white" style={{ fontSize: 12 }}>
                {c.symbol}
            </Text>
        </View>
    );
}

type Props = { form: AddBusinessFormState; onSubmitEditing?: () => void };

/** Fields of the "Add New Business" sheet: name, type chips, currency select, theme swatches. */
export function AddBusinessFields({ form, onSubmitEditing }: Props) {
    const { t } = useTranslation("business");
    const { values, set } = form;
    const [focused, setFocused] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const currency = currencyOf(values.currency);

    return (
        <View className="gap-5 pb-2">
            {/* Business name */}
            <View>
                <FieldLabel>{t("name")}</FieldLabel>
                <View className={cn("rounded-[22px] p-1", focused ? "bg-[#FDE9ED]" : "bg-transparent")}>
                    <TextInput
                        value={values.name}
                        onChangeText={(t) => set("name", t)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onSubmitEditing={onSubmitEditing}
                        placeholder={t("namePlaceholder")}
                        placeholderTextColor="#A9A1A4"
                        maxLength={BUSINESS_NAME_MAX}
                        autoCapitalize="words"
                        returnKeyType="done"
                        selectionColor={colors.primary}
                        cursorColor={colors.primary}
                        accessibilityLabel={t("nameA11y")}
                        className={cn(
                            "h-14 rounded-[18px] border bg-white px-5 font-jakarta text-text-dark",
                            focused ? "border-[#E0566E]" : "border-[#E6E0DE]",
                        )}
                        style={{ fontSize: 17 }}
                    />
                </View>
            </View>

            {/* Business type */}
            <View>
                <FieldLabel>{t("type")}</FieldLabel>
                <View className="flex-row flex-wrap gap-2.5">
                    {BUSINESS_TYPE_KEYS.map((key: BusinessType) => {
                        const selected = values.type === key;
                        return (
                            <Pressable
                                key={key}
                                onPress={() => set("type", key)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                className={cn(
                                    "h-12 flex-row items-center gap-2 rounded-brand-16 border px-4 active:opacity-80",
                                    selected ? "border-[#F1A7B5] bg-[#FFF2F4]" : "border-[#ECE7E5] bg-[#F7F5F4]",
                                )}>
                                <BusinessIcon type={key} size={24} />
                                <Text
                                    className={cn(
                                        "text-para-base",
                                        selected ? "font-jakarta-semibold text-primary" : "font-jakarta text-[#3A3537]",
                                    )}>
                                    {t(`types.${key}.label`)}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Currency */}
            <View>
                <FieldLabel>{t("currency")}</FieldLabel>
                <View className="overflow-hidden rounded-[22px] border border-[#ECE7E5] bg-[#F7F5F4]">
                    <Pressable
                        onPress={() => setCurrencyOpen((o) => !o)}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: currencyOpen }}
                        accessibilityLabel={t("currencyA11y", { name: t(`currencies.${currency.code}`) })}
                        className="h-16 flex-row items-center gap-3 px-4 active:opacity-80">
                        <CurrencyBadge code={currency.code} />
                        <Text className="flex-1 font-jakarta-medium text-text-dark" style={{ fontSize: 16 }}>
                            {t(`currencies.${currency.code}`)} ({currency.code})
                        </Text>
                        <View style={{ transform: [{ rotate: currencyOpen ? "180deg" : "0deg" }] }}>
                            <ChevronDown size={20} color="#5F5A5C" strokeWidth={2.2} />
                        </View>
                    </Pressable>

                    {currencyOpen
                        ? CURRENCIES.filter((c) => c.code !== currency.code).map((c) => (
                              <Pressable
                                  key={c.code}
                                  onPress={() => {
                                      set("currency", c.code);
                                      setCurrencyOpen(false);
                                  }}
                                  accessibilityRole="button"
                                  className="h-14 flex-row items-center gap-3 border-t border-[#ECE7E5] px-4 active:bg-[#EFEBEA]">
                                  <CurrencyBadge code={c.code} />
                                  <Text className="flex-1 font-jakarta text-[#3A3537]" style={{ fontSize: 15 }}>
                                      {t(`currencies.${c.code}`)} ({c.code})
                                  </Text>
                              </Pressable>
                          ))
                        : null}
                </View>
            </View>

            {/* Theme color */}
            <View>
                <FieldLabel>{t("theme")}</FieldLabel>
                <View className="flex-row items-center gap-2">
                    {THEME_COLOR_KEYS.map((key: ThemeColor) => {
                        const selected = values.theme === key;
                        const [, deep] = THEME_COLORS[key];
                        return (
                            <Pressable
                                key={key}
                                onPress={() => set("theme", key)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                accessibilityLabel={t("themeA11y", { color: t(`themes.${key}`) })}
                                hitSlop={4}
                                className="h-[54px] w-[54px] items-center justify-center rounded-full border-[3px]"
                                style={{ borderColor: selected ? deep : "transparent" }}>
                                <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-full">
                                    <GradientFill colors={THEME_COLORS[key]} />
                                    {selected ? <Check size={18} color="#fff" strokeWidth={3} /> : null}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}
