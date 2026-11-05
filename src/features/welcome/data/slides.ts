// nativeApp\src\features\welcome\data\slides.ts

export const SLIDE_ICONS = {
    chart: { ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" },
    people: { ios: "person.2.fill", android: "groups", web: "groups" },
    laptop: { ios: "laptopcomputer", android: "laptop", web: "laptop" },
} as const;

/** Title and text live in onboarding:slides.<key>. */
export type Slide = { key: "control" | "business" | "devices"; image: number; icon: keyof typeof SLIDE_ICONS };

export const SLIDES: Slide[] = [
    { key: "control", image: require("@/assets/images/slide_1.jpg"), icon: "chart" },
    { key: "business", image: require("@/assets/images/slide_2.jpg"), icon: "people" },
    { key: "devices", image: require("@/assets/images/slide_3.jpg"), icon: "laptop" },
];
