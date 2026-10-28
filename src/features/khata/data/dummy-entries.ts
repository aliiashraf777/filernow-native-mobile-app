// nativeApp\src\features\khata\data\dummy-entries.ts

import { IExpenseEntry, IParty } from "../types";

// Dummy seed data, gives a first-time user a fully populated dashboard to
// explore before they add real entries. Fully deletable via existing CRUD
// (deleteEntry) once the user starts entering their own data. Backend
// contract pending: this seed logic disappears once GET /api/expense-manager/entries
// returns real user data, the store should stop seeding once that exists.
export const dummyExpenseEntries: IExpenseEntry[] = [
    // Expenses, spread across last 6 months, several in the last 7 days
    { id: "e1", kind: "expense", subject: "Electricity Bill", categoryId: "cat-utilities", amount: 8500, date: "2026-09-10" },
    { id: "e2", kind: "expense", subject: "Grocery Run", categoryId: "cat-food", amount: 12300, date: "2026-09-08" },
    { id: "e3", kind: "expense", subject: "Fuel", categoryId: "cat-transport", amount: 6200, date: "2026-09-06" },
    { id: "e4", kind: "expense", subject: "Internet Bill", categoryId: "cat-utilities", amount: 4200, date: "2026-09-05" },
    { id: "e5", kind: "expense", subject: "Grocery Run", categoryId: "cat-food", amount: 9800, date: "2026-09-04" },
    { id: "e6", kind: "expense", subject: "Office Rent Share", categoryId: "cat-rent", amount: 35000, date: "2026-08-15" },
    { id: "e7", kind: "expense", subject: "Business Software Subscription", categoryId: "cat-business-expense", amount: 15000, date: "2026-08-05" },
    { id: "e8", kind: "expense", subject: "Clinic Visit", categoryId: "cat-other-expense", amount: 3000, date: "2026-07-18" },
    { id: "e9", kind: "expense", subject: "Car Maintenance", categoryId: "cat-transport", amount: 9800, date: "2026-06-22" },
    { id: "e10", kind: "expense", subject: "Grocery Run", categoryId: "cat-food", amount: 11000, date: "2026-05-14" },
    { id: "e11", kind: "expense", subject: "Office Rent Share", categoryId: "cat-rent", amount: 35000, date: "2026-04-15" },

    // Income
    { id: "i1", kind: "income", subject: "Freelance Payment", categoryId: "cat-business-income", amount: 65000, date: "2026-09-05" },
    { id: "i2", kind: "income", subject: "Monthly Salary", categoryId: "cat-salary", amount: 120000, date: "2026-08-01" },
    { id: "i3", kind: "income", subject: "Consulting Fee", categoryId: "cat-business-income", amount: 45000, date: "2026-07-10" },

    // Debt (linked to dummyParties below)
    { id: "d1", kind: "debt", subject: "Hassan Traders", partyId: "demo-p2", categoryId: "cat-udhaar-liya", amount: 25000, date: "2026-09-01", time: "10:30" },
    { id: "d2", kind: "debt", subject: "Ali Ashraf", partyId: "demo-p1", categoryId: "cat-udhaar-diya", amount: 18000, date: "2026-08-20", time: "14:05" },
    { id: "d3", kind: "debt", subject: "Bilal Ahmed", partyId: "demo-p3", categoryId: "cat-udhaar-diya", amount: 15000, date: "2026-08-20", time: "16:40" },
    { id: "d4", kind: "debt", subject: "Ali Ashraf", partyId: "demo-p1", categoryId: "cat-udhaar-diya", amount: 10000, date: "2026-07-05", time: "11:15" },
    { id: "d5", kind: "debt", subject: "Ali Ashraf", partyId: "demo-p1", categoryId: "cat-udhaar-diya-wapis-liya", amount: 10000, date: "2026-07-20", time: "19:45" },
];

export const dummyParties: IParty[] = [
    { id: "demo-p1", slug: "ali-ashraf-d1a2b", name: "Ali Ashraf", phone: "03001234567", type: "customer", createdAt: "2026-07-01T09:00:00.000Z" },
    { id: "demo-p2", slug: "hassan-traders-d3c4e", name: "Hassan Traders", phone: "03211234567", type: "supplier", createdAt: "2026-07-01T09:05:00.000Z" },
    { id: "demo-p3", slug: "bilal-ahmed-d5f6a", name: "Bilal Ahmed", type: "customer", createdAt: "2026-07-01T09:10:00.000Z" },
];
