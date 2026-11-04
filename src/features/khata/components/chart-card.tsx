// nativeApp\src\features\khata\components\chart-card.tsx

import type { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = { title: string; subtitle?: string; children: ReactNode };

export function ChartCard({ title, subtitle, children }: Props) {
    return (
        <View className="mx-4 mt-4 rounded-brand-16 border border-border-clr bg-white p-3">
            <Text className="font-jakarta-bold text-sm text-text-dark">{title}</Text>
            {subtitle ? <Text className="mt-0.5 font-jakarta text-xs text-text-secondary-muter">{subtitle}</Text> : null}
            <View className="mt-3">{children}</View>
        </View>
    );
}

export function ChartEmpty({ title, text }: { title: string; text: string }) {
    return (
        <View className="items-center py-6">
            <Text className="font-jakarta-semibold text-xs text-text-secondary">{title}</Text>
            <Text className="mt-0.5 text-center font-jakarta text-xs text-text-secondary-muter">{text}</Text>
        </View>
    );
}