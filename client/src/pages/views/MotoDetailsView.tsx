import { useMotoSettings, useUpdateMotoSettings } from "@/hooks/use-financial";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bike, Calculator, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const schema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  totalValue: z.coerce.number().min(0),
  entry: z.coerce.number().min(0),
  interestRate: z.coerce.number().min(0),
  totalInstallments: z.coerce.number().min(1),
  installmentValue: z.coerce.number().min(0),
});

export function MotoDetailsView() {
  const { data: settings, isLoading } = useMotoSettings();
  const updateMutation = useUpdateMotoSettings();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Financiamento da Moto",
      totalValue: 21490,
      entry: 2000,
      interestRate: 1.8,
      totalInstallments: 48,
      installmentValue: 640,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        title: (settings as any).title || "Financiamento da Moto",
        totalValue: (settings as any).totalValue || 0,
        entry: (settings as any).entry || 0,
        interestRate: (settings as any).interestRate || 0,
        totalInstallments: (settings as any).totalInstallments || 1,
        installmentValue: (settings as any).installmentValue || 0,
      });
    }
  }, [settings, form]);

  const watchedValues = form.watch();
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'totalValue' || name === 'entry' || name === 'interestRate' || name === 'totalInstallments') {
        const total = Number(value.totalValue || 0);
        const entry = Number(value.entry || 0);
        const rate = Number(value.interestRate || 0) / 100;
        const months = Number(value.totalInstallments || 1);
        
        const financedAmount = total - entry;
        
        if (financedAmount > 0 && months > 0) {
          let installment;
          if (rate > 0) {
            // Price Table formula: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
            installment = financedAmount * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
          } else {
            installment = financedAmount / months;
          }
          
          form.setValue('installmentValue', Number(installment.toFixed(2)));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    updateMutation.mutate(data);
  };

  const safeTitle = watchedValues.title || "Financiamento";
  const safeTotalValue = watchedValues.totalValue || 0;
  const safeEntry = watchedValues.entry || 0;
  const safeInstallmentValue = watchedValues.installmentValue || 0;
  const safeTotalInstallments = watchedValues.totalInstallments || 0;

  const totalFinanced = safeInstallmentValue * safeTotalInstallments;
  const totalPaid = totalFinanced + safeEntry;
  const totalInterest = totalPaid - safeTotalValue;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Form */}
      <Card className="border-border/50 shadow-lg shadow-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Detalhes do Financiamento</CardTitle>
              <CardDescription>Configure os dados do seu item financiado</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O que está sendo financiado? (ex: Moto, Carro, Casa)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Financiamento da Moto" className="font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total do Bem (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="text-lg font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrada (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa Juros (% a.m.)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalInstallments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="installmentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Parcela (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-4" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" /> Resumo do Custo
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-slate-400">Valor do Bem ({safeTitle})</span>
                <span className="text-2xl font-bold font-mono text-blue-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeTotalValue)}
                </span>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-slate-400">Total Parcelado</span>
                <span className="text-2xl font-bold font-mono">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFinanced)}
                </span>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-slate-400">Total em Juros (est.)</span>
                <span className="text-2xl font-bold font-mono text-rose-400">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(totalInterest) ? 0 : totalInterest)}
                </span>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <span className="text-slate-400">Entrada</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeEntry)}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-slate-300 font-medium">Custo Final Total</span>
                  <span className="text-4xl font-bold font-mono tracking-tight text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
                  </span>
                </div>
                <p className="text-right text-xs text-slate-500">Considerando entrada + todas as parcelas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-emerald-900">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-1" />
            <div>
              <h4 className="font-bold text-lg">Planejamento</h4>
              <p className="mt-1 text-emerald-800 leading-relaxed">
                Com o valor da parcela de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeInstallmentValue)}</strong>, 
                certifique-se de que este valor esteja incluído nos seus Gastos Fixos mensais para manter o saldo correto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
