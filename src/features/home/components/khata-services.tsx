// nativeApp\src\features\home\components\khata-services.tsx

import { Link } from "expo-router";
import { ChartNoAxesColumn } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { SectionCard } from "@/features/home/components/section-card";
import { ServiceTile } from "@/features/home/components/service-tile";
import { KHATA_SERVICES } from "@/features/home/data/services";
import { useOpenService } from "@/features/home/hooks/use-open-service";
import { colors } from "@/theme/tokens";

function ViewDashboardLink() {
    return (
        <Link href="/khata" asChild>
            <Pressable accessibilityRole="link" hitSlop={8} className="flex-row items-center gap-1 active:opacity-70">
                <ChartNoAxesColumn size={16} color={colors.primary} strokeWidth={2.4} />
                <Text className="font-jakarta-medium text-para-small text-primary">View Dashboard</Text>
            </Pressable>
        </Link>
    );
}

/** Expense Manager tools as soft grey tiles in a 3-column grid. */
export function KhataServices() {
    const openService = useOpenService();

    return (
        <SectionCard
            title="Khata Services"
            action={<ViewDashboardLink />}
        >
            <View className="-m-[5px] flex-row flex-wrap">
                {KHATA_SERVICES.map((item) => (
                    <View key={item.id} className="w-1/3 p-[5px]">
                        <ServiceTile item={item} onPress={() => openService(item.label, item.href)} />
                    </View>
                ))}
            </View>
        </SectionCard>
    );
}
