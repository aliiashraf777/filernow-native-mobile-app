// nativeApp\src\constants\expense-manager-icons.ts

// Expense Manager icon set (expense-manager-icons/), resized from 1024px to 256px transparent PNGs.
export const emIcons = {
    // header
    gridMenu: require("@/assets/images/expense-manager/header/grid-menu.png"),
    wallet: require("@/assets/images/expense-manager/header/wallet.png"),
    // home
    budget: require("@/assets/images/expense-manager/home/budget.png"),
    categories: require("@/assets/images/expense-manager/home/categories.png"),
    expenses: require("@/assets/images/expense-manager/home/expenses.png"),
    receipts: require("@/assets/images/expense-manager/home/receipts.png"),
    reports: require("@/assets/images/expense-manager/home/reports.png"),
    savings: require("@/assets/images/expense-manager/home/savings.png"),
    // advanced
    ai: require("@/assets/images/expense-manager/advanced/ai.png"),
    currency: require("@/assets/images/expense-manager/advanced/currency.png"),
    export: require("@/assets/images/expense-manager/advanced/export.png"),
    recurring: require("@/assets/images/expense-manager/advanced/recurring.png"),
    scan: require("@/assets/images/expense-manager/advanced/scan.png"),
    shared: require("@/assets/images/expense-manager/advanced/shared.png"),
    // more
    aboutUs: require("@/assets/images/expense-manager/more/about-us.png"),
    addExpense: require("@/assets/images/expense-manager/more/add-expense.png"),
    appLock: require("@/assets/images/expense-manager/more/app-lock.png"),
    backup: require("@/assets/images/expense-manager/more/backup.png"),
    bell: require("@/assets/images/expense-manager/more/bell.png"),
    budgetAlert: require("@/assets/images/expense-manager/more/budget-alert.png"),
    businessCurrency: require("@/assets/images/expense-manager/more/business-currency.png"),
    calculator: require("@/assets/images/expense-manager/more/calculator.png"),
    crown: require("@/assets/images/expense-manager/more/crown.png"),
    darkMode: require("@/assets/images/expense-manager/more/dark-mode.png"),
    deleteAccount: require("@/assets/images/expense-manager/more/delete-account.png"),
    deleteBusiness: require("@/assets/images/expense-manager/more/delete-business.png"),
    expenseCard: require("@/assets/images/expense-manager/more/expense-card.png"),
    facebook: require("@/assets/images/expense-manager/more/facebook.png"),
    googleDrive: require("@/assets/images/expense-manager/more/google-drive.png"),
    helpSupport: require("@/assets/images/expense-manager/more/help-support.png"),
    kyc: require("@/assets/images/expense-manager/more/kyc.png"),
    language: require("@/assets/images/expense-manager/more/language.png"),
    loginPin: require("@/assets/images/expense-manager/more/login-pin.png"),
    logout: require("@/assets/images/expense-manager/more/logout.png"),
    multiDevices: require("@/assets/images/expense-manager/more/multi-devices.png"),
    quickNotification: require("@/assets/images/expense-manager/more/quick-notification.png"),
    recycleBin: require("@/assets/images/expense-manager/more/recycle-bin.png"),
    reportsBars: require("@/assets/images/expense-manager/more/reports-bars.png"),
    settings: require("@/assets/images/expense-manager/more/settings.png"),
    whatsapp: require("@/assets/images/expense-manager/more/whatsapp.png"),
    youtube: require("@/assets/images/expense-manager/more/youtube.png"),
    // nav (bottom tab bar); "-inactive" = greyscale for unselected tabs
    navHome: require("@/assets/images/expense-manager/nav/home.png"),
    navHomeInactive: require("@/assets/images/expense-manager/nav/home-inactive.png"),
    navKhata: require("@/assets/images/expense-manager/nav/khata.png"),
    navKhataInactive: require("@/assets/images/expense-manager/nav/khata-inactive.png"),
    navMyAdvocate: require("@/assets/images/expense-manager/nav/my-advocate.png"),
    navMyAdvocateInactive: require("@/assets/images/expense-manager/nav/my-advocate-inactive.png"),
    navTaxAdvisor: require("@/assets/images/expense-manager/nav/tax-advisor.png"),
    navTaxAdvisorInactive: require("@/assets/images/expense-manager/nav/tax-advisor-inactive.png"),
    navAiCircle: require("@/assets/images/expense-manager/nav/ai-circle.png"),
} as const;

export type EmIconName = keyof typeof emIcons;
