import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertIncome, type InsertFixedExpense, type InsertVariableExpense, type InsertSavingsGoal } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { MotoDetails } from "@shared/schema";

// --- Incomes ---
export function useIncomes() {
  return useQuery({
    queryKey: [api.incomes.list.path],
    queryFn: async () => {
      const res = await fetch(api.incomes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch incomes");
      return api.incomes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertIncome) => {
      const res = await fetch(api.incomes.create.path, {
        method: api.incomes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create income record");
      return api.incomes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomes.list.path] });
      toast({ title: "Success", description: "Income record added successfully" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertIncome>) => {
      const url = buildUrl(api.incomes.update.path, { id });
      const res = await fetch(url, {
        method: api.incomes.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update income record");
      return api.incomes.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomes.list.path] });
      toast({ title: "Saved", description: "Income record updated" });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.incomes.delete.path, { id });
      const res = await fetch(url, { method: api.incomes.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete income");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomes.list.path] });
      toast({ title: "Deletado", description: "Fonte de renda removida" });
    },
  });
}

// --- Fixed Expenses ---
export function useFixedExpenses() {
  return useQuery({
    queryKey: [api.fixedExpenses.list.path],
    queryFn: async () => {
      const res = await fetch(api.fixedExpenses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch fixed expenses");
      return api.fixedExpenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateFixedExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertFixedExpense) => {
      const res = await fetch(api.fixedExpenses.create.path, {
        method: api.fixedExpenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create fixed expense");
      return api.fixedExpenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fixedExpenses.list.path] });
      toast({ title: "Success", description: "Fixed expense added" });
    },
  });
}

export function useUpdateFixedExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertFixedExpense>) => {
      const url = buildUrl(api.fixedExpenses.update.path, { id });
      const res = await fetch(url, {
        method: api.fixedExpenses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update fixed expense");
      return api.fixedExpenses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fixedExpenses.list.path] });
      toast({ title: "Saved", description: "Fixed expense updated" });
    },
  });
}

export function useDeleteFixedExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.fixedExpenses.delete.path, { id });
      const res = await fetch(url, { method: api.fixedExpenses.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete fixed expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.fixedExpenses.list.path] });
      toast({ title: "Deleted", description: "Expense removed" });
    },
  });
}

export function useCloneFixedExpenses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { fromMonth: string; toMonth: string }) => {
      const res = await fetch(api.fixedExpenses.clone.path, {
        method: api.fixedExpenses.clone.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to clone expenses");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.fixedExpenses.list.path] });
      toast({ 
        title: "Importação concluída", 
        description: `${data.count} gastos importados com sucesso.` 
      });
    },
    onError: (err) => {
      toast({ title: "Erro ao importar", description: err.message, variant: "destructive" });
    }
  });
}

// --- Variable Expenses ---
export function useVariableExpenses() {
  return useQuery({
    queryKey: [api.variableExpenses.list.path],
    queryFn: async () => {
      const res = await fetch(api.variableExpenses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch variable expenses");
      return api.variableExpenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateVariableExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertVariableExpense) => {
      const res = await fetch(api.variableExpenses.create.path, {
        method: api.variableExpenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add variable expense");
      return api.variableExpenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.variableExpenses.list.path] });
      toast({ title: "Added", description: "Expense recorded successfully" });
    },
  });
}

export function useUpdateVariableExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertVariableExpense>) => {
      const url = buildUrl(api.variableExpenses.update.path, { id });
      const res = await fetch(url, {
        method: api.variableExpenses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update variable expense");
      return api.variableExpenses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.variableExpenses.list.path] });
      toast({ title: "Saved", description: "Variable expense updated" });
    },
  });
}

export function useSyncVariableExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/variable-expenses/${id}/sync`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to sync expense");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.variableExpenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.fixedExpenses.list.path] });
      toast({ title: "Sincronizado", description: "Gasto enviado para os Fixos" });
    },
  });
}

export function useDeleteVariableExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.variableExpenses.delete.path, { id });
      const res = await fetch(url, { method: api.variableExpenses.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete variable expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.variableExpenses.list.path] });
      toast({ title: "Deleted", description: "Expense removed" });
    },
  });
}

// --- Savings Goals ---
export function useSavingsGoals() {
  return useQuery({
    queryKey: [api.savingsGoals.list.path],
    queryFn: async () => {
      const res = await fetch(api.savingsGoals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch savings goals");
      return api.savingsGoals.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertSavingsGoal>) => {
      const url = buildUrl(api.savingsGoals.update.path, { id });
      const res = await fetch(url, {
        method: api.savingsGoals.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update savings goal");
      return api.savingsGoals.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.savingsGoals.list.path] });
    },
  });
}

// --- Settings (Moto) ---
export function useMotoSettings() {
  return useQuery({
    queryKey: [api.settings.get.path, 'moto'],
    queryFn: async () => {
      const url = buildUrl(api.settings.get.path, { key: 'moto' });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = api.settings.get.responses[200].parse(await res.json());
      return data.value as MotoDetails;
    },
  });
}

export function useUpdateMotoSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: MotoDetails) => {
      const url = buildUrl(api.settings.update.path, { key: 'moto' });
      const res = await fetch(url, {
        method: api.settings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: data }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path, 'moto'] });
      toast({ title: "Settings Saved", description: "Motorcycle details updated" });
    },
  });
}
