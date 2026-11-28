import { type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Input } from "@/components/ui/form";
import { cn } from "@/lib/cn";

type FilterOption<T extends string> = { value: T; label: string; count: number };
type Props<T extends string> = {
    title: string;
    total: number;
    filters: FilterOption<T>[];
    activeFilter: T;
    onFilterChange: (value: T) => void;
    query: string;
    onQueryChange: (value: string) => void;
    searchPlaceholder: string;
    action?: ReactNode;
};

export function TransactionListHeader<T extends string>({
    title,
    total,
    filters,
    activeFilter,
    onFilterChange,
    query,
    onQueryChange,
    searchPlaceholder,
    action,
}: Props<T>) {
    return (
        <View className="mx-4 mt-4 overflow-hidden rounded-t-brand-16 border-x border-t border-border-clr bg-white">
            <View className="flex-row items-center justify-between gap-3 px-3 pb-2 pt-3">
                <View className="flex-1 flex-row items-center gap-2">
                    <Text className="font-jakarta-bold text-sm text-text-dark">{title}</Text>
                    <View className="min-w-7 items-center rounded-full bg-page-bg px-2 py-1">
                        <Text className="font-jakarta-semibold text-[10px] text-text-secondary">{total}</Text>
                    </View>
                </View>
                {action}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                {filters.map(({ value, label, count }) => {
                    const selected = value === activeFilter;
                    return (
                        <Pressable
                            key={value}
                            accessibilityRole="tab"
                            accessibilityState={{ selected }}
                            onPress={() => onFilterChange(value)}
                            className={cn(
                                "min-h-9 flex-row items-center gap-2 rounded-full border px-3",
                                selected ? "border-primary bg-primary" : "border-border-clr bg-white active:bg-page-bg",
                            )}>
                            <Text className={cn("font-jakarta-semibold text-xs", selected ? "text-white" : "text-text-secondary")}>
                                {label}
                            </Text>
                            <Text className={cn("font-jakarta-bold text-[10px]", selected ? "text-white" : "text-text-secondary-muted")}>
                                {count}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View className="border-b border-border-clr px-3 pb-3 pt-1">
                <Input
                    icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
                    placeholder={searchPlaceholder}
                    value={query}
                    onChangeText={onQueryChange}
                    autoCorrect={false}
                />
            </View>
        </View>
    );
}
