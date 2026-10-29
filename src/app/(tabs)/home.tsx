// nativeApp\src\app\(tabs)\home.tsx

import { ScrollView } from "react-native";

import { AdvanceServices } from "@/features/home/components/advance-services";
import { KhataServices } from "@/features/home/components/khata-services";
import { KhataShortcuts } from "@/features/home/components/khata-shortcuts";
import { PromoBanner } from "@/features/home/components/promo-banner";

export default function Home() {
    return (
        <ScrollView className="flex-1 bg-page-bg" contentContainerClassName="gap-brand-12 px-brand-12 pt-1 pb-brand-12">
            <PromoBanner />
            <KhataServices />
            <KhataShortcuts />
            <AdvanceServices />
        </ScrollView>
    );
}
