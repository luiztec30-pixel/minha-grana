import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  
  // Incomes
  app.get(api.incomes.list.path, async (req, res) => {
    const data = await storage.getIncomes();
    res.json(data);
  });
  
  app.post(api.incomes.create.path, async (req, res) => {
    try {
      const input = api.incomes.create.input.parse(req.body);
      const result = await storage.createIncome(input);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.incomes.update.path, async (req, res) => {
    try {
      const input = api.incomes.update.input.parse(req.body);
      const result = await storage.updateIncome(Number(req.params.id), input);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.incomes.delete.path, async (req, res) => {
    await storage.deleteIncome(Number(req.params.id));
    res.status(204).send();
  });

  // Fixed Expenses
  app.get(api.fixedExpenses.list.path, async (req, res) => {
    const data = await storage.getFixedExpenses();
    res.json(data);
  });

  app.post(api.fixedExpenses.create.path, async (req, res) => {
    const input = api.fixedExpenses.create.input.parse(req.body);
    const result = await storage.createFixedExpense(input);
    res.status(201).json(result);
  });

  app.put(api.fixedExpenses.update.path, async (req, res) => {
    try {
      const input = api.fixedExpenses.update.input.parse(req.body);
      const result = await storage.updateFixedExpense(Number(req.params.id), input);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.fixedExpenses.delete.path, async (req, res) => {
    await storage.deleteFixedExpense(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.fixedExpenses.clone.path, async (req, res) => {
    try {
      const { fromMonth, toMonth } = api.fixedExpenses.clone.input.parse(req.body);
      const count = await storage.cloneFixedExpenses(fromMonth, toMonth);
      res.status(201).json({ count });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Variable Expenses
  app.get(api.variableExpenses.list.path, async (req, res) => {
    const data = await storage.getVariableExpenses();
    res.json(data);
  });

  app.post(api.variableExpenses.create.path, async (req, res) => {
    const input = api.variableExpenses.create.input.parse(req.body);
    const result = await storage.createVariableExpense(input);
    res.status(201).json(result);
  });

  app.delete(api.variableExpenses.delete.path, async (req, res) => {
    await storage.deleteVariableExpense(Number(req.params.id));
    res.status(204).send();
  });

  app.put(api.variableExpenses.update.path, async (req, res) => {
    try {
      const input = api.variableExpenses.update.input.parse(req.body);
      const result = await storage.updateVariableExpense(Number(req.params.id), input);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/variable-expenses/:id/sync", async (req, res) => {
    try {
      await storage.syncVariableToFixed(Number(req.params.id));
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Savings Goals
  app.get(api.savingsGoals.list.path, async (req, res) => {
    const data = await storage.getSavingsGoals();
    res.json(data);
  });

  app.post(api.savingsGoals.create.path, async (req, res) => {
    const input = api.savingsGoals.create.input.parse(req.body);
    const result = await storage.createSavingsGoal(input);
    res.status(201).json(result);
  });

  app.put(api.savingsGoals.update.path, async (req, res) => {
    const input = api.savingsGoals.update.input.parse(req.body);
    const result = await storage.updateSavingsGoal(Number(req.params.id), input);
    res.json(result);
  });

  // Settings (Moto)
  app.get(api.settings.get.path, async (req, res) => {
    const result = await storage.getSetting(req.params.key);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.json(result);
  });

  app.post(api.settings.update.path, async (req, res) => {
    const result = await storage.updateSetting(req.params.key, req.body.value);
    res.json(result);
  });

  // Seed Data
  const incomesData = await storage.getIncomes();
  if (incomesData.length === 0) {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    for (const month of months) {
      await storage.createIncome({ 
        month, 
        name: "Principal",
        data: {
          ifood: "246", // Default as per user
          auxilio: "120" // Default as per user
        }
      });
    }

    // Fixed Expenses
    const defaultFixed = [
      { name: "Aluguel", amount: "600" },
      { name: "Celular", amount: "32.50" },
      { name: "Academia", amount: "89.90" },
      { name: "Rancho", amount: "550" },
      { name: "Faculdade", amount: "475" },
      { name: "Internet", amount: "90.10" },
      { name: "Água", amount: "64" },
      { name: "Energia", amount: "65" },
      { name: "Moto", amount: "640" },
      { name: "Anel de noivado", amount: "199.90" },
      { name: "Casamento", amount: "674" },
    ];

    for (const expense of defaultFixed) {
      await storage.createFixedExpense(expense);
    }

    // Moto Settings
    await storage.updateSetting("moto", {
      entry: 2000,
      interestRate: 1.8,
      totalInstallments: 48,
      installmentValue: 640
    });
  }

  return httpServer;
}
