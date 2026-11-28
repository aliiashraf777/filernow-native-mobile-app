// nativeApp\src\components\ui\form.tsx

import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { type ReactNode, useState } from "react";
import { Pressable, Text, TextInput, type TextInputProps, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

type FieldProps = { label: string; hint?: string; error?: string; required?: boolean; className?: string; children: ReactNode };

export function Field({ label, hint, error, required, className, children }: FieldProps) {
    return (
        <View className={cn("mb-4", className)}>
            <Text className="mb-1.5 font-jakarta-semibold text-xs text-text-dark">
                {label}
                {required ? <Text className="text-danger"> *</Text> : null}
            </Text>
            {children}
            {error ? (
                <Text className="mt-1 font-jakarta text-xs text-danger">{error}</Text>
            ) : hint ? (
                <Text className="mt-1 font-jakarta text-xs text-text-secondary-muter">{hint}</Text>
            ) : null}
        </View>
    );
}

type InputProps = TextInputProps & { icon?: SymbolViewProps["name"]; prefix?: string };

export function Input({ icon, prefix, onFocus, onBlur, ...rest }: InputProps) {
    const [focused, setFocused] = useState(false);
    return (
        <View
            className={cn(
                "h-12 flex-row items-center rounded-brand-8 border bg-page-bg px-3",
                focused ? "border-primary" : "border-border-clr",
            )}>
            {icon ? <SymbolView name={icon} size={16} tintColor={colors["text-secondary-muted"]} /> : null}
            {prefix ? (
                <Text className="font-jakarta-semibold text-xs text-text-secondary">{prefix}</Text>
            ) : null}
            <TextInput
                placeholderTextColor={colors["text-secondary-muter"]}
                onFocus={(e) => {
                    setFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    onBlur?.(e);
                }}
                className="ml-2 flex-1 font-jakarta text-sm text-text-dark"
                {...rest}
            />
        </View>
    );
}

type ButtonProps = { label: string; onPress: () => void; disabled?: boolean; className?: string };

export function FormButton({ label, onPress, disabled, className }: ButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPress}
            className={cn(
                "min-h-12 items-center justify-center rounded-brand-8 bg-primary active:opacity-80",
                disabled && "opacity-40",
                className,
            )}>
            <Text className="font-jakarta-bold text-sm text-white">{label}</Text>
        </Pressable>
    );
}