import { useSavingsGoals, useUpdateSavingsGoal } from "@/hooks/use-financial";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PiggyBank } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function SavingsView() {
  const { data: goals = [], isLoading } = useSavingsGoals();
  const updateMutation = useUpdateSavingsGoal();
  const queryClient = useQueryClient();

  // Local state for editing
  const [localData, setLocalData] = useState<Record<string, Record<string, string>>>({});

  // Ensure initial data exists
  useEffect(() => {
    if (!isLoading && goals) {
      // Check if we need to seed data (this should ideally be done backend side, but for frontend-driven simplicity)
      // Actually, since there's no create button on UI, we must rely on backend seeding or create automatically here.
      // Let's create missing months if they don't exist.
      MONTHS.forEach(async (month) => {
        const exists = goals.find(g => g.month === month);
        if (!exists) {
          // Fire and forget creation
          await fetch(api.savingsGoals.create.path, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ month, goal: "0", saved: "0" }),
             credentials: 'include'
          });
          queryClient.invalidateQueries({ queryKey: [api.savingsGoals.list.path] });
        }
      });
    }
  }, [goals, isLoading, queryClient]);

  const handleInputChange = (id: number, field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  const handleBlur = (id: number, field: string, originalValue: string) => {
    const newValue = localData[id]?.[field];
    if (newValue !== undefined && newValue !== String(originalValue)) {
      updateMutation.mutate({ id, [field]: newValue });
    }
  };

  const sortedGoals = [...goals].sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-xl">
          <PiggyBank className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">Metas de Economia</h2>
          <p className="text-muted-foreground max-w-2xl mt-1">
            Defina quanto você quer guardar por mês e acompanhe seu progresso.
            Isso é apenas para controle visual e não afeta o saldo principal.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Mês</TableHead>
              <TableHead>Meta (R$)</TableHead>
              <TableHead>Economizado (R$)</TableHead>
              <TableHead>Progresso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGoals.map((item) => {
              const goal = Number(localData[item.id]?.goal ?? item.goal);
              const saved = Number(localData[item.id]?.saved ?? item.saved);
              const progress = goal > 0 ? (saved / goal) * 100 : 0;

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.month}</TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      className="h-8 w-32 bg-transparent border-transparent hover:border-border focus:bg-white transition-all"
                      value={localData[item.id]?.goal ?? item.goal}
                      onChange={(e) => handleInputChange(item.id, 'goal', e.target.value)}
                      onBlur={() => handleBlur(item.id, 'goal', item.goal)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      className="h-8 w-32 bg-transparent border-transparent hover:border-border focus:bg-white transition-all font-bold text-emerald-600"
                      value={localData[item.id]?.saved ?? item.saved}
                      onChange={(e) => handleInputChange(item.id, 'saved', e.target.value)}
                      onBlur={() => handleBlur(item.id, 'saved', item.saved)}
                    />
                  </TableCell>
                  <TableCell className="w-[40%]">
                    <div className="flex items-center gap-3">
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                      <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
