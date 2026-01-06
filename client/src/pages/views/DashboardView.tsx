import { useIncomes, useFixedExpenses, useVariableExpenses } from "@/hooks/use-financial";
import { StatCard } from "@/components/StatCard";
import { ArrowUpCircle, ArrowDownCircle, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardView() {
  const { data: incomes = [], isLoading: isLoadingIncomes } = useIncomes();
  const { data: fixedExpenses = [], isLoading: isLoadingFixed } = useFixedExpenses();
  const { data: variableExpenses = [], isLoading: isLoadingVariable } = useVariableExpenses();

  const isLoading = isLoadingIncomes || isLoadingFixed || isLoadingVariable;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-96 md:col-span-3 rounded-2xl" />
      </div>
    );
  }

  // --- Calculations ---
  
  // Helper to get total fixed expenses for a specific month
  const getFixedForMonth = (monthName: string) => {
    return fixedExpenses
      .filter(f => f.month === monthName)
      .reduce((sum, item) => sum + Number(item.amount), 0);
  };

  // Helper to get total income for a specific month
  const getIncomeForMonth = (monthName: string) => {
    return incomes
      .filter(i => i.month === monthName)
      .reduce((sum, item) => {
        const data = item.data || {};
        const rowTotal = Object.values(data).reduce((rowSum, val) => rowSum + Number(val || 0), 0);
        return sum + rowTotal;
      }, 0);
  };

  // Helper to get variable expenses for a specific month
  const getVariableForMonth = (monthName: string) => {
    return variableExpenses
      .filter(v => v.month === monthName)
      .reduce((sum, item) => sum + Number(item.amount), 0);
  };

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Chart Data Construction
  const chartData = months.map(month => {
    const inc = getIncomeForMonth(month);
    const fixed = getFixedForMonth(month);
    const variable = getVariableForMonth(month);
    const totalExp = fixed + variable;
    const balance = inc - totalExp;

    return {
      name: month,
      Receita: inc,
      Gastos: totalExp,
      Saldo: balance
    };
  });

  // Totals for Cards (Annual or YTD - let's do Annual Sum for dashboard overview)
  const totalAnnualIncome = chartData.reduce((sum, d) => sum + d.Receita, 0);
  const totalAnnualExpenses = chartData.reduce((sum, d) => sum + d.Gastos, 0);
  const totalBalance = totalAnnualIncome - totalAnnualExpenses;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Receita Total (Ano)" 
          value={totalAnnualIncome} 
          type="positive"
          icon={<ArrowUpCircle className="w-6 h-6" />}
          subtitle="Soma de todos os meses"
        />
        <StatCard 
          title="Gastos Totais (Ano)" 
          value={totalAnnualExpenses} 
          type="negative"
          icon={<ArrowDownCircle className="w-6 h-6" />}
          subtitle="Fixos + Variáveis"
        />
        <StatCard 
          title="Saldo Final" 
          value={totalBalance} 
          type={totalBalance >= 0 ? "positive" : "negative"}
          icon={<Scale className="w-6 h-6" />}
          subtitle="Receita - Gastos"
        />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Fluxo Financeiro Anual</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `R$${value/1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
