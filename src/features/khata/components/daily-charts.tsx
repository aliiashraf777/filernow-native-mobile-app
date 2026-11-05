// nativeApp\src\features\khata\components\daily-charts.tsx

import { memo } from "react";
import { View } from "react-native";

import { CardsBalanceChart } from "@/features/khata/components/cards-balance-chart";
import { CategoryBreakdown } from "@/features/khata/components/category-breakdown";
import { TrendChart } from "@/features/khata/components/trend-chart";
import { useDailyCharts } from "@/features/khata/hooks/use-daily-charts";

/** All Daily Khata charts. Memoized so typing in the search box doesn't redraw them. */
export const DailyCharts = memo(function DailyCharts() {
    const { trends, breakdown, total } = useDailyCharts();

    return (
        <View>
            <TrendChart title="Activity" dataByGranularity={trends} defaultGranularity="week" />
            <CategoryBreakdown data={breakdown} total={total} />
            <TrendChart title="Expenses by Period" dataByGranularity={trends} variant="pie" defaultGranularity="month" />
            <CardsBalanceChart />
        </View>
    );
});