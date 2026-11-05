// nativeApp\src\components\tab-bar\app-tab-bar.tsx

import { Image } from "expo-image";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { type EmIconName, emIcons } from "@/constants/expense-manager-icons";
import type { Resources } from "@/i18n/resources";

type TabLabelKey = keyof Resources["common"]["tabs"];

type TabDef = {
    /** Route name inside src/app/(tabs). */
    name: string;
    /** Key under common:tabs. */
    labelKey: TabLabelKey;
    icon: EmIconName;
    iconInactive?: EmIconName;
    /** The raised round button in the middle. */
    center?: boolean;
};

// Order = order in the bar. Routes not listed here (e.g. settings) are not shown.
export const TAB_DEFS: TabDef[] = [
    { name: "home", labelKey: "home", icon: "navHome", iconInactive: "navHomeInactive" },
    { name: "khata", labelKey: "khata", icon: "navKhata", iconInactive: "navKhataInactive" },
    { name: "ask-ai", labelKey: "askAi", icon: "navAiCircle", center: true },
    { name: "my-advocate", labelKey: "myAdvocate", icon: "navMyAdvocate", iconInactive: "navMyAdvocateInactive" },
    { name: "tax-advisor", labelKey: "taxAdvisor", icon: "navTaxAdvisor", iconInactive: "navTaxAdvisorInactive" },
];

const ACTIVE = "#C8102E";
const INACTIVE = "#8A8285";
const ICON = 26;
// AI orb + white ring = 50px; its bottom lines up with the other icons, so it rises ~16px above the bar.
const CENTER = 44;
const CENTER_RING = 3;

/** Bottom navigation: flat white bar, 3D icons (grey when inactive), slightly raised "Ask AI" orb in the middle. */
export function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
    const { t } = useTranslation();
    const tabs = TAB_DEFS.map((def) => ({ def, route: state.routes.find((r) => r.name === def.name) })).filter(
        (t): t is { def: TabDef; route: (typeof state.routes)[number] } => t.route !== undefined,
    );
    const focusedName = state.routes[state.index]?.name;

    return (
        <View
            className="flex-row bg-white"
            style={{
                borderTopWidth: 1,
                borderTopColor: "#EFEAEA",
                paddingTop: 8,
                paddingBottom: Math.max(insets.bottom, 8),
            }}>
            {tabs.map(({ def, route }) => {
                const focused = route.name === focusedName;
                const { options } = descriptors[route.key];

                const onPress = () => {
                    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                    if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
                };
                const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: focused }}
                        accessibilityLabel={options.tabBarAccessibilityLabel ?? t(`tabs.${def.labelKey}`)}
                        className="flex-1 items-center active:opacity-70">
                        <View style={{ height: ICON, width: CENTER + CENTER_RING * 2, alignItems: "center" }}>
                            {def.center ? (
                                <CenterOrb />
                            ) : (
                                <Image
                                    source={emIcons[focused || !def.iconInactive ? def.icon : def.iconInactive]}
                                    contentFit="contain"
                                    style={{ width: ICON, height: ICON, opacity: focused ? 1 : 0.85 }}
                                />
                            )}
                        </View>

                        <Text
                            numberOfLines={1}
                            className={focused ? "font-jakarta-bold" : "font-jakarta-medium"}
                            style={{ marginTop: 4, fontSize: 11, color: focused ? ACTIVE : INACTIVE }}>
                            {t(`tabs.${def.labelKey}`)}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

/** Gradient AI orb in a thin white ring, lifted a little above the bar. */
function CenterOrb() {
    const outer = CENTER + CENTER_RING * 2;

    return (
        <View
            style={{
                position: "absolute",
                bottom: 0,
                width: outer,
                height: outer,
                borderRadius: outer / 2,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
            }}>
            <Image source={emIcons.navAiCircle} contentFit="contain" style={{ width: CENTER, height: CENTER }} />
        </View>
    );
}
