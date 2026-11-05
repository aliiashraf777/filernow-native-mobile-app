// nativeApp\src\features\home\components\advance-services.tsx

import { Crown } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { SectionCard } from "@/features/home/components/section-card";
import { ServiceTile } from "@/features/home/components/service-tile";
import { ADVANCE_SERVICES } from "@/features/home/data/services";
import { useOpenService } from "@/features/home/hooks/use-open-service";

function PremiumBadge() {
    const { t } = useTranslation("home");
    return (
        <View className="flex-row items-center gap-1.5 rounded-full border border-[#F2B5BF] bg-[#FFF3F4] px-3 py-1">
            <Crown size={15} color="#E9A21B" fill="#F7B733" strokeWidth={2} />
            <Text className="font-jakarta-extrabold text-[12px] tracking-wider text-primary">{t("premium")}</Text>
        </View>
    );
}

/** Premium tools as soft grey tiles in a 3-column grid. */
export function AdvanceServices() {
    const { t } = useTranslation("home");
    const openService = useOpenService();

    return (
        <SectionCard
            title={t("advancedTools")}
            titleClassName="font-jakarta text-heading-h5 text-[#454545]"
            action={<PremiumBadge />}
        >
            <View className="-m-[5px] flex-row flex-wrap">
                {ADVANCE_SERVICES.map((item) => (
                    <View key={item.id} className="w-1/3 p-[5px]">
                        <ServiceTile item={item} onPress={() => openService(t(`services.${item.labelKey}`), item.href)} />
                    </View>
                ))}
            </View>
        </SectionCard>
    );
}
