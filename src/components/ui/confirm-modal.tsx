import { AlertTriangle, X } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/cn";

type Props = {
    visible: boolean;
    title: string;
    message: string;
    cancelLabel: string;
    confirmLabel: string;
    onCancel: () => void;
    onConfirm: () => void;
    destructive?: boolean;
};

export function ConfirmModal({
    visible,
    title,
    message,
    cancelLabel,
    confirmLabel,
    onCancel,
    onConfirm,
    destructive = false,
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}>
            <View className="flex-1 items-center justify-center bg-text-dark/55 px-5">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={cancelLabel}
                    onPress={onCancel}
                    className="absolute inset-0"
                />
                <View className="w-full max-w-[420px] rounded-brand-24 bg-white p-5">
                    <View className="mb-4 flex-row items-start">
                        <View
                            className={cn(
                                "h-11 w-11 items-center justify-center rounded-brand-12",
                                destructive ? "bg-danger-bg" : "bg-primary-tint",
                            )}>
                            <AlertTriangle
                                size={21}
                                className={destructive ? "text-danger" : "text-primary"}
                                strokeWidth={2.2}
                            />
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={cancelLabel}
                            onPress={onCancel}
                            hitSlop={8}
                            className="ml-auto h-10 w-10 items-center justify-center rounded-brand-12 bg-surface-muted active:opacity-70">
                            <X size={18} className="text-text-secondary" strokeWidth={2.2} />
                        </Pressable>
                    </View>

                    <Text
                        accessibilityRole="header"
                        className="font-jakarta-extrabold text-heading-h5 text-text-dark">
                        {title}
                    </Text>
                    <Text className="mt-2 font-jakarta text-sm leading-5 text-text-secondary">
                        {message}
                    </Text>

                    <View className="mt-5 flex-row gap-3">
                        <Pressable
                            accessibilityRole="button"
                            onPress={onCancel}
                            className="min-h-12 flex-1 items-center justify-center rounded-brand-12 border border-border-strong bg-white active:bg-page-bg">
                            <Text className="font-jakarta-semibold text-sm text-text-secondary">
                                {cancelLabel}
                            </Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                onConfirm();
                                onCancel();
                            }}
                            className={cn(
                                "min-h-12 flex-1 items-center justify-center rounded-brand-12 active:opacity-85",
                                destructive ? "bg-danger" : "bg-primary",
                            )}>
                            <Text className="font-jakarta-semibold text-sm text-white">
                                {confirmLabel}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
