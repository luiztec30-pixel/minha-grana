import { pgTable, text, serial, integer, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Receitas (Income)
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(), // Jan, Fev, Mar...
  name: text("name").notNull().default("Principal"), // Added name for multiple incomes
  data: jsonb("data").notNull().default({}), // Dynamic columns stored as JSON { "CLT": "1000", "App": "500" }
});

// 2. Gastos Fixos (Fixed Expenses) - Items that repeat every month
export const fixedExpenses = pgTable("fixed_expenses", {
  id: serial("id").primaryKey(),
  month: text("month").notNull().default("Jan"), // Added month
  name: text("name").notNull(), // Aluguel, Internet, etc.
  amount: numeric("amount").notNull(),
  originId: integer("origin_id"), // Track sync from variable expense
});

// 3. Gastos Variáveis (Variable Expenses)
export const variableExpenses = pgTable("variable_expenses", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  isSynced: boolean("is_synced").default(false), // Track if synced to fixed
});

// 4. Meta Economia (Savings Goals)
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  goal: numeric("goal").notNull().default("0"),
  saved: numeric("saved").notNull().default("0"),
});

// 5. Moto Detalhe (Motorcycle Details) - Stored as a single settings record or table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: jsonb("value").notNull(), // Store generic JSON data
});


// 6. Usuários (Users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertIncomeSchema = createInsertSchema(incomes).omit({ id: true });
export const insertFixedExpenseSchema = createInsertSchema(fixedExpenses).omit({ id: true });
export const insertVariableExpenseSchema = createInsertSchema(variableExpenses).omit({ id: true });
export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// Types
export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type InsertFixedExpense = z.infer<typeof insertFixedExpenseSchema>;

export type VariableExpense = typeof variableExpenses.$inferSelect;
export type InsertVariableExpense = z.infer<typeof insertVariableExpenseSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type Setting = typeof settings.$inferSelect;

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MotoDetails = {
  totalValue: number;
  entry: number;
  interestRate: number;
  totalInstallments: number;
  installmentValue: number;
};
