import React, { useState, useEffect } from "react";
import { useVariableExpenses, useCreateVariableExpense, useDeleteVariableExpense, useUpdateVariableExpense, useSyncVariableExpense } from "@/hooks/use-financial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, Pencil, X, ArrowUpRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVariableExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { clsx } from "clsx";

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formSchema = insertVariableExpenseSchema.extend({
  amount: z.coerce.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor inválido"),
});

export function VariableExpensesView() {
  const { data: expenses = [], isLoading } = useVariableExpenses();
  const createMutation = useCreateVariableExpense();
  const updateMutation = useUpdateVariableExpense();
  const deleteMutation = useDeleteVariableExpense();
  const syncMutation = useSyncVariableExpense();
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: MONTHS[new Date().getMonth()], // Default to current month
      description: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (editingId) {
      const expense = expenses.find(e => e.id === editingId);
      if (expense) {
        form.reset({
          month: expense.month,
          description: expense.description,
          amount: String(expense.amount),
        });
      }
    }
  }, [editingId, expenses, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data }, {
        onSuccess: () => {
          setEditingId(null);
          form.reset({ ...data, description: "", amount: "" });
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => form.reset({ ...data, description: "", amount: "" }), // Keep month selected
      });
    }
  };

  const filteredExpenses = filterMonth === "all" 
    ? expenses 
    : expenses.filter(e => e.month === filterMonth);

  const totalFiltered = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-900/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              {editingId ? <Pencil className="w-5 h-5 text-accent" /> : <PlusCircle className="w-5 h-5 text-accent" />}
            </div>
            <h2 className="text-lg font-semibold">{editingId ? "Editar Gasto" : "Novo Gasto Variável"}</h2>
          </div>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); form.reset(); }} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4 mr-2" /> Cancelar Edição
            </Button>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-rose-300" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormControl>
                    <Input placeholder="Descrição (ex: Peça do carro)" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="number" placeholder="Valor" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" {...field} />
                    </FormControl>
                    <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90 text-white shrink-0" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingId ? <Pencil className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </Button>
                  </div>
                  <FormMessage className="text-rose-300" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* List Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Histórico de Gastos</h3>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Filtrar Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Total na visualização: <span className="text-rose-600 font-bold ml-1">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFiltered)}</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mês</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[150px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.month}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {expense.description}
                      {(expense as any).isSynced && (
                        <div className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          <Check className="w-2.5 h-2.5" /> Fixo
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-rose-600 font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(expense.amount))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={clsx(
                                "w-8 h-8 transition-colors",
                                (expense as any).isSynced ? "text-emerald-500" : "text-muted-foreground hover:text-emerald-500"
                              )}
                              onClick={() => syncMutation.mutate(expense.id)}
                              disabled={syncMutation.isPending}
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {(expense as any).isSynced ? "Atualizar em Gastos Fixos" : "Enviar para Gastos Fixos"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <button 
                        onClick={() => setEditingId(expense.id)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(expense.id)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
