// nativeApp\src\features\home\components\section-card.tsx

import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

/** Soft drop shadow shared by every home-screen card. */
export const cardShadow = {
    shadowColor: colors["primary-deep"],
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
} as const;

type Props = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
};

/** White rounded card with a muted title row, used for each home section. */
export function SectionCard({ title, action, children, className, titleClassName }: Props) {
    return (
        <View
            // style={cardShadow}
            className={cn("bg-white p-brand-12 border border-border-clr/65 rounded-brand-12", className)}
        >
            <View className="mb-brand-12 min-h-7 flex-row items-center justify-between px-1">
                <Text className={cn("font-jakarta-medium text-heading-h6 text-text-secondary", titleClassName)}>{title}</Text>
                {action}
            </View>
            {children}
        </View>
    );
}
