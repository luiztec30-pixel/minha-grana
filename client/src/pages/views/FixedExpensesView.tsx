import React, { useState, useEffect } from "react";
import { useFixedExpenses, useCreateFixedExpense, useDeleteFixedExpense, useUpdateFixedExpense, useCloneFixedExpenses } from "@/hooks/use-financial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Receipt, Pencil, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFixedExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const formSchema = insertFixedExpenseSchema.extend({
  amount: z.coerce.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor inválido"),
});

export function FixedExpensesView() {
  const { data: expenses = [], isLoading } = useFixedExpenses();
  const createMutation = useCreateFixedExpense();
  const updateMutation = useUpdateFixedExpense();
  const deleteMutation = useDeleteFixedExpense();
  const cloneMutation = useCloneFixedExpenses();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("Jan");
  const [importSourceMonth, setImportSourceMonth] = useState<string>("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: "",
      month: "Jan",
    },
  });

  useEffect(() => {
    if (editingId) {
      const expense = expenses.find(e => e.id === editingId);
      if (expense) {
        form.reset({
          name: expense.name,
          amount: String(expense.amount),
          month: expense.month,
        });
      }
    } else {
      form.reset({
        name: "",
        amount: "",
        month: selectedMonth,
      });
    }
  }, [editingId, expenses, form, selectedMonth]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data }, {
        onSuccess: () => {
          setEditingId(null);
          form.reset();
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => form.reset({ ...form.getValues(), name: "", amount: "" }),
      });
    }
  };

  const handleImport = () => {
    if (!importSourceMonth) return;
    cloneMutation.mutate({ fromMonth: importSourceMonth, toMonth: selectedMonth }, {
      onSuccess: () => {
        setIsImportDialogOpen(false);
        setImportSourceMonth("");
      }
    });
  };

  const filteredExpenses = expenses.filter(e => e.month === selectedMonth);
  const totalFixed = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Col: List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" /> Gastos Fixos
                </h2>
                <p className="text-sm text-muted-foreground">Recorrentes no mês selecionado</p>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="w-4 h-4" /> Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Gastos Fixos</DialogTitle>
                    <DialogDescription>
                      Deseja importar os gastos fixos de qual mês para {selectedMonth}?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={importSourceMonth} onValueChange={setImportSourceMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mês de origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.filter(m => m !== selectedMonth).map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleImport} disabled={!importSourceMonth || cloneMutation.isPending}>
                      {cloneMutation.isPending ? "Importando..." : "Confirmar Importação"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total {selectedMonth}</span>
              <div className="text-2xl font-bold text-rose-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFixed)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="font-medium text-slate-700 dark:text-slate-200">{expense.name}</div>
                  {(expense as any).originId && (
                    <div className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Variável
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white mr-2">
                    R$ {Number(expense.amount).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => setEditingId(expense.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(expense.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredExpenses.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum gasto fixo cadastrado para {selectedMonth}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Col: Add Form */}
      <div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-24">
          <h3 className="font-semibold text-primary mb-4">
            {editingId ? "Editar Gasto" : "Adicionar Novo"}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-slate-900">
                          <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Nome (ex: Aluguel)" className="bg-white dark:bg-slate-900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="Valor (R$)" className="bg-white dark:bg-slate-900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId 
                    ? (updateMutation.isPending ? "Salvando..." : "Salvar Alterações")
                    : (createMutation.isPending ? "Adicionar Gasto" : "Adicionar Gasto")
                  }
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
