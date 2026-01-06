import React, { useEffect, useState } from "react";
import { useIncomes, useCreateIncome, useUpdateIncome, useDeleteIncome, useMotoSettings, useUpdateMotoSettings } from "@/hooks/use-financial";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Settings2, X } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function IncomesView() {
  const { data: incomes = [], isLoading } = useIncomes();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();
  
  // Use settings to store column names
  const { data: settings } = useMotoSettings(); // Reusing settings storage for columns
  const updateSettings = useUpdateMotoSettings();

  const [localData, setLocalData] = useState<Record<string, any>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>("Jan");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const columns = (settings as any)?.incomeColumns || ["CLT", "App", "iFood", "Auxílio"];

  const handleInputChange = (id: number, field: string, value: string, isNested = false) => {
    if (isNested) {
      setLocalData(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          data: {
            ...(prev[id]?.data || incomes.find(i => i.id === id)?.data || {}),
            [field]: value
          }
        }
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [id]: {
          ...(prev[id] || {}),
          [field]: value
        }
      }));
    }
  };

  const handleBlur = (id: number, field: string, originalValue: any, isNested = false) => {
    const item = incomes.find(i => i.id === id);
    if (!item) return;

    if (isNested) {
      const newData = localData[id]?.data;
      if (newData && JSON.stringify(newData) !== JSON.stringify(item.data)) {
        updateIncome.mutate({ id, data: { ...item.data, ...newData } });
      }
    } else {
      const newValue = localData[id]?.[field];
      if (newValue !== undefined && newValue !== String(originalValue)) {
        updateIncome.mutate({ id, [field]: newValue });
      }
    }
  };

  const handleAddIncome = () => {
    const defaultData = columns.reduce((acc: any, col: string) => ({ ...acc, [col]: "0" }), {});
    createIncome.mutate({
      month: selectedMonth,
      name: "Nova Receita",
      data: defaultData
    });
  };

  const handleAddColumn = () => {
    if (!newColumnName || columns.includes(newColumnName)) return;
    const newColumns = [...columns, newColumnName];
    updateSettings.mutate({ ...settings as any, incomeColumns: newColumns });
    setNewColumnName("");
  };

  const handleRemoveColumn = (colToRemove: string) => {
    const newColumns = columns.filter((c: string) => c !== colToRemove);
    updateSettings.mutate({ ...settings as any, incomeColumns: newColumns });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const filteredIncomes = incomes.filter(i => i.month === selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Gestão de Receitas</h2>
            <p className="text-sm text-muted-foreground">Personalize suas colunas e fontes de renda</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings2 className="w-4 h-4" /> Colunas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Colunas de Receita</DialogTitle>
                <DialogDescription>Adicione ou remova colunas da sua tabela de receitas.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nome da nova coluna" 
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                  />
                  <Button onClick={handleAddColumn} size="icon"><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {columns.map((col: string) => (
                    <div key={col} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
                      {col}
                      <button onClick={() => handleRemoveColumn(col)} className="text-muted-foreground hover:text-rose-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleAddIncome} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Fonte
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableHead className="min-w-[150px]">Fonte</TableHead>
                {columns.map((col: string) => (
                  <TableHead key={col} className="text-right">{col}</TableHead>
                ))}
                <TableHead className="text-right font-bold text-primary">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.map((item) => {
                const currentData = localData[item.id]?.data || item.data || {};
                const currentTotal = columns.reduce((sum: number, col: string) => sum + Number(currentData[col] || 0), 0);

                return (
                  <TableRow key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <Input 
                        className="h-8 bg-transparent border-transparent hover:border-border focus:bg-white transition-all font-medium"
                        value={localData[item.id]?.name ?? item.name}
                        onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                        onBlur={() => handleBlur(item.id, 'name', item.name)}
                      />
                    </TableCell>
                    
                    {columns.map((col: string) => (
                      <TableCell key={col}>
                        <Input 
                          type="number" 
                          className="h-8 w-24 bg-transparent border-transparent hover:border-border focus:bg-white transition-all text-right ml-auto"
                          value={currentData[col] ?? "0"}
                          onChange={(e) => handleInputChange(item.id, col, e.target.value, true)}
                          onBlur={() => handleBlur(item.id, col, item.data[col], true)}
                        />
                      </TableCell>
                    ))}
                    
                    <TableCell className="text-right font-bold text-emerald-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotal)}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-all"
                        onClick={() => deleteIncome.mutate(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredIncomes.length > 0 && (
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                  <TableCell>Total Geral</TableCell>
                  {columns.map((col: string) => {
                    const colTotal = filteredIncomes.reduce((sum, item) => {
                      const currentData = localData[item.id]?.data || item.data || {};
                      return sum + Number(currentData[col] || 0);
                    }, 0);
                    return (
                      <TableCell key={col} className="text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(colTotal)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right text-emerald-600 text-lg">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      filteredIncomes.reduce((totalSum, item) => {
                        const currentData = (localData[item.id] as any)?.data || item.data || {};
                        return totalSum + columns.reduce((rowSum: number, col: string) => rowSum + Number(currentData[col] || 0), 0);
                      }, 0)
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}

              {filteredIncomes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 3} className="text-center py-10 text-muted-foreground">
                    Nenhuma receita cadastrada para {selectedMonth}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
