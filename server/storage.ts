import { db } from "./db";
import { 
  incomes, fixedExpenses, variableExpenses, savingsGoals, settings,
  type Income, type InsertIncome,
  type FixedExpense, type InsertFixedExpense,
  type VariableExpense, type InsertVariableExpense,
  type SavingsGoal, type InsertSavingsGoal,
  type Setting
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Incomes
  getIncomes(): Promise<Income[]>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income>;
  deleteIncome(id: number): Promise<void>;
  
  // Fixed Expenses
  getFixedExpenses(): Promise<FixedExpense[]>;
  createFixedExpense(expense: InsertFixedExpense): Promise<FixedExpense>;
  updateFixedExpense(id: number, updates: Partial<InsertFixedExpense>): Promise<FixedExpense>;
  deleteFixedExpense(id: number): Promise<void>;
  cloneFixedExpenses(fromMonth: string, toMonth: string): Promise<number>;

  // Variable Expenses
  getVariableExpenses(): Promise<VariableExpense[]>;
  createVariableExpense(expense: InsertVariableExpense): Promise<VariableExpense>;
  updateVariableExpense(id: number, updates: Partial<InsertVariableExpense>): Promise<VariableExpense>;
  deleteVariableExpense(id: number): Promise<void>;
  syncVariableToFixed(variableId: number): Promise<void>;

  // Savings Goals
  getSavingsGoals(): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: any): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // Incomes
  async getIncomes(): Promise<Income[]> {
    return await db.select().from(incomes);
  }
  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const [result] = await db.insert(incomes).values(insertIncome).returning();
    return result;
  }
  async updateIncome(id: number, updates: Partial<InsertIncome>): Promise<Income> {
    const [result] = await db.update(incomes).set(updates).where(eq(incomes.id, id)).returning();
    return result;
  }
  async deleteIncome(id: number): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  // Fixed Expenses
  async getFixedExpenses(): Promise<FixedExpense[]> {
    return await db.select().from(fixedExpenses);
  }
  async createFixedExpense(insertExpense: InsertFixedExpense): Promise<FixedExpense> {
    const [result] = await db.insert(fixedExpenses).values(insertExpense).returning();
    return result;
  }
  async updateFixedExpense(id: number, updates: Partial<InsertFixedExpense>): Promise<FixedExpense> {
    const [result] = await db.update(fixedExpenses).set(updates).where(eq(fixedExpenses.id, id)).returning();
    return result;
  }
  async deleteFixedExpense(id: number): Promise<void> {
    await db.delete(fixedExpenses).where(eq(fixedExpenses.id, id));
  }
  async cloneFixedExpenses(fromMonth: string, toMonth: string): Promise<number> {
    const sourceExpenses = await db.select().from(fixedExpenses).where(eq(fixedExpenses.month, fromMonth));
    if (sourceExpenses.length === 0) return 0;

    const newExpenses = sourceExpenses.map(({ id, ...expense }) => ({
      ...expense,
      month: toMonth
    }));

    const result = await db.insert(fixedExpenses).values(newExpenses).returning();
    return result.length;
  }

  // Variable Expenses
  async getVariableExpenses(): Promise<VariableExpense[]> {
    return await db.select().from(variableExpenses);
  }
  async createVariableExpense(insertExpense: InsertVariableExpense): Promise<VariableExpense> {
    const [result] = await db.insert(variableExpenses).values(insertExpense).returning();
    return result;
  }
  async updateVariableExpense(id: number, updates: Partial<InsertVariableExpense>): Promise<VariableExpense> {
    const [result] = await db.update(variableExpenses).set(updates).where(eq(variableExpenses.id, id)).returning();
    return result;
  }
  async deleteVariableExpense(id: number): Promise<void> {
    await db.delete(variableExpenses).where(eq(variableExpenses.id, id));
  }

  async syncVariableToFixed(variableId: number): Promise<void> {
    const [expense] = await db.select().from(variableExpenses).where(eq(variableExpenses.id, variableId));
    if (!expense) return;

    await db.transaction(async (tx) => {
      // Check if already synced
      const [existingFixed] = await tx.select().from(fixedExpenses).where(eq(fixedExpenses.originId, variableId));
      
      if (existingFixed) {
        // Update existing fixed expense
        await tx.update(fixedExpenses)
          .set({
            name: expense.description,
            amount: expense.amount,
            month: expense.month,
          })
          .where(eq(fixedExpenses.originId, variableId));
      } else {
        // Create new fixed expense
        await tx.insert(fixedExpenses).values({
          month: expense.month,
          name: expense.description,
          amount: expense.amount,
          originId: expense.id,
        });
      }

      // Mark variable as synced
      await tx.update(variableExpenses)
        .set({ isSynced: true })
        .where(eq(variableExpenses.id, variableId));
    });
  }

  // Savings Goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return await db.select().from(savingsGoals);
  }
  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [result] = await db.insert(savingsGoals).values(insertGoal).returning();
    return result;
  }
  async updateSavingsGoal(id: number, updates: Partial<InsertSavingsGoal>): Promise<SavingsGoal> {
    const [result] = await db.update(savingsGoals).set(updates).where(eq(savingsGoals.id, id)).returning();
    return result;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [result] = await db.select().from(settings).where(eq(settings.key, key));
    return result;
  }
  async updateSetting(key: string, value: any): Promise<Setting> {
    const [existing] = await db.select().from(settings).where(eq(settings.key, key));
    if (existing) {
      const [result] = await db.update(settings).set({ value }).where(eq(settings.key, key)).returning();
      return result;
    } else {
      const [result] = await db.insert(settings).values({ key, value }).returning();
      return result;
    }
  }
}

export const storage = new DatabaseStorage();
