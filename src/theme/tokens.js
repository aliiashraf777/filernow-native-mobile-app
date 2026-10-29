// nativeApp\src\theme\tokens.js

// Single source of truth. Used by tailwind.config.js AND by TS code (tintColor etc.).
// Key names match the FilerNow dashboard @theme wherever the meaning is the same.
const colors = {
    // primary: "#D3222C", // dashboard primary is #C8102E!
    // "primary-light": "#E8A5A9",
    primary: "#C8102E", // same as dashboard --brand-primary
    "primary-light": "#FFB4C0", // dashboard --brand-primary-light
    "primary-tint": "#FFF6F6",
    "primary-lighter": "#C8102E1A", // dashboard --brand-primary-lighter (10% alpha)
    "primary-soft": "#EBA3A7", // banner placeholder background
    "primary-deep": "#64163C", // shadow tint
    "accent-gold": "#E9A21B", // premium / crown icon
    "text-dark": "#161315",
    "text-secondary": "#463C40",
    "text-secondary-muted": "#6B7280",
    "text-secondary-muter": "#9CA3AF",
    "text-tertiary": "#F9FAFB",
    "text-muted": "rgba(17, 17, 17, 0.5)",
    "text-link": "#0059D9",
    "page-bg": "#FBFCF9",
    "card-bg-clr": "#F8F9FA",
    "surface-muted": "#F6F1F2",
    "border-clr": "#ECE5E7",
    "border-strong": "#DED2D6",

    danger: "#DC2626",
    "danger-bg": "#FEF2F2",
    success: "#16A34A",
    "success-bg": "#ECFDF3",
    warning: "#F59E0B",
    "warning-bg": "#FFFBEB",
    info: "#2563EB",
    "info-bg": "#EFF6FF",

    "chip-green-bg": "#DCFCE7",
    "chip-green": "#16A34A",
    "chip-blue-bg": "#DBEAFE",
    "chip-blue": "#2563EB",
    "chip-purple-bg": "#EDE9FE",
    "chip-purple": "#7C3AED",
    "chip-red-bg": "#FEE2E2",
    "chip-red": "#DC2626",
};

const fontFamily = {
    jakarta: ["PlusJakartaSans_400Regular"],
    "jakarta-medium": ["PlusJakartaSans_500Medium"],
    "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
    "jakarta-bold": ["PlusJakartaSans_700Bold"],
    "jakarta-extrabold": ["PlusJakartaSans_800ExtraBold"],
    wordmark: ["Comfortaa_700Bold"],
};

// Mobile-base values of the dashboard type scale (size + line-height only;
// weight comes from the font-jakarta-* family classes).
const fontSize = {
    "heading-h1": ["40px", { lineHeight: "48px" }],
    "heading-h2": ["28px", { lineHeight: "34px" }],
    "heading-h3": ["20px", { lineHeight: "28px" }],
    "heading-h4": ["18px", { lineHeight: "26px" }],
    "heading-h5": ["16px", { lineHeight: "22px" }],
    "heading-h6": ["14px", { lineHeight: "20px" }],
    "para-tiny": ["12px", { lineHeight: "16px" }],
    "para-small": ["13px", { lineHeight: "18px" }],
    "para-base": ["15px", { lineHeight: "22px" }],
    "para-18": ["16px", { lineHeight: "24px" }],
};

const radius = {
    "brand-8": "8px",
    "brand-12": "12px",
    "brand-16": "16px",
    "brand-24": "24px",
    "brand-32": "32px",
};

const spacing = { brand: "16px", "brand-8": "8px", "brand-12": "12px", "brand-20": "20px" };

module.exports = { colors, fontFamily, fontSize, radius, spacing };