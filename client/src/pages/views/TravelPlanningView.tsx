import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, MapPin, Calculator, TrendingDown, Info, Plus, Trash2, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ManualCostItem {
  id: string;
  title: string;
  value: number;
}

export function TravelPlanningView() {
  const [packageCost, setPackageCost] = useState(6794);
  const [packageItems, setPackageItems] = useState<string>("Hospedagem + Voo");
  const [origin, setOrigin] = useState<string>("Manaus");
  const [destination, setDestination] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addDays(new Date(), 4), 'yyyy-MM-dd'));
  
  const daysCount = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)) + 1);

  const [manualCosts, setManualCosts] = useState<ManualCostItem[]>([
    { id: "1", title: "Passagens Aéreas", value: 0 },
    { id: "2", title: "Hospedagem Total", value: 0 },
    { id: "3", title: "Alimentação (Estimado)", value: 0 },
    { id: "4", title: "Transporte/Passeios", value: 0 },
  ]);

  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemValue, setNewItemValue] = useState("");

  const [packageExtraCosts, setPackageExtraCosts] = useState<ManualCostItem[]>([]);
  const [newPackageItemTitle, setNewPackageItemTitle] = useState("");
  const [newPackageItemValue, setNewPackageItemValue] = useState("");

  const addCostItem = () => {
    if (!newItemTitle) return;
    const newItem: ManualCostItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItemTitle,
      value: Number(newItemValue) || 0
    };
    setManualCosts([...manualCosts, newItem]);
    setNewItemTitle("");
    setNewItemValue("");
  };

  const addPackageExtraItem = () => {
    if (!newPackageItemTitle) return;
    const newItem: ManualCostItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newPackageItemTitle,
      value: Number(newPackageItemValue) || 0
    };
    setPackageExtraCosts([...packageExtraCosts, newItem]);
    setNewPackageItemTitle("");
    setNewPackageItemValue("");
  };

  const removeCostItem = (id: string) => {
    setManualCosts(manualCosts.filter(item => item.id !== id));
  };

  const removePackageExtraItem = (id: string) => {
    setPackageExtraCosts(packageExtraCosts.filter(item => item.id !== id));
  };

  const updateCostValue = (id: string, value: number) => {
    setManualCosts(manualCosts.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const updatePackageExtraValue = (id: string, value: number) => {
    setPackageExtraCosts(packageExtraCosts.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const totalManual = manualCosts.reduce((acc, curr) => acc + curr.value, 0);
  const totalPackageExtras = packageExtraCosts.reduce((acc, curr) => acc + curr.value, 0);
  const totalPackageFinal = packageCost + totalPackageExtras;
  const difference = totalPackageFinal - totalManual;
  const isPackageCheaper = difference < 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary" /> Planejamento de Viagem
          </h2>
          <p className="text-muted-foreground">Compare o pacote da agência com a reserva manual</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex items-center gap-3 max-w-md">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Roteiro Sugerido:</strong> Saída de {origin}. De {startDate ? format(new Date(startDate + 'T00:00:00'), "dd/MM", { locale: ptBR }) : ''} até {endDate ? format(new Date(endDate + 'T00:00:00'), "dd/MM", { locale: ptBR }) : ''} ({daysCount} dias).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Package Cost */}
        <Card className="lg:col-span-1 border-primary/20 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" /> Valor do Pacote
            </CardTitle>
            <CardDescription>Valor total oferecido pela agência</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custo do Pacote (R$)</label>
                <Input 
                  type="number" 
                  value={packageCost} 
                  onChange={(e) => setPackageCost(Number(e.target.value))}
                  className="text-2xl font-bold h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Itens Inclusos</label>
                <Input 
                  type="text" 
                  value={packageItems} 
                  onChange={(e) => setPackageItems(e.target.value)}
                  placeholder="Ex: Hospedagem + Voo + Passeios"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Ida</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-9"
                    />
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Volta</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-9"
                    />
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origem</label>
                  <Input 
                    type="text" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Ex: Manaus"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destino</label>
                  <Input 
                    type="text" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: Gramado"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground text-xs uppercase font-bold">Resumo do Pacote:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-bold uppercase">
                    {packageItems}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-muted-foreground">Origem:</span>
                  <span className="font-medium">{origin}</span>
                </div>
                {destination && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Destino:</span>
                    <span className="font-medium text-primary">{destination}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duração:</span>
                  <span className="font-medium">{daysCount} dias</span>
                </div>
              </div>

              {/* Package Extra Costs Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Custos Adicionais</h4>
                </div>

                {/* Add New Package Extra Item Form */}
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-[120px] space-y-1">
                    <Input 
                      placeholder="Novo item extra..." 
                      value={newPackageItemTitle}
                      onChange={(e) => setNewPackageItemTitle(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Input 
                      type="number"
                      placeholder="0,00"
                      value={newPackageItemValue}
                      onChange={(e) => setNewPackageItemValue(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button 
                    onClick={addPackageExtraItem}
                    size="sm" 
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Extra Items List */}
                <div className="space-y-2">
                  {packageExtraCosts.map((item) => (
                    <div key={item.id} className="group flex items-center gap-2 p-2 bg-card border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                      </div>
                      <div className="w-24">
                        <Input 
                          type="number"
                          value={item.value || ""}
                          onChange={(e) => updatePackageExtraValue(item.id, Number(e.target.value))}
                          className="h-7 text-xs font-bold py-0 px-2"
                        />
                      </div>
                      <button 
                        onClick={() => removePackageExtraItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Package Total Breakdown */}
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal Pacote:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(packageCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Extras:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPackageExtras)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold">VALOR FINAL:</span>
                    <span className="text-xl font-black text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPackageFinal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Comparison */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Reserva Manual (Estimativa)
            </CardTitle>
            <CardDescription>Adicione e edite os itens da sua reserva por fora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add New Item Form */}
              <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Novo Item</label>
                  <Input 
                    placeholder="Ex: Passeio de Buggy" 
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="w-32 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Valor (R$)</label>
                  <Input 
                    type="number"
                    placeholder="0,00"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addCostItem}
                    size="sm" 
                    className="h-9 gap-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </Button>
                </div>
              </div>

              {/* Dynamic List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {manualCosts.map((item) => (
                  <div key={item.id} className="group relative p-3 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate pr-6">
                        {item.title}
                      </label>
                      <button 
                        onClick={() => removeCostItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Input 
                      type="number" 
                      placeholder="R$ 0,00"
                      value={item.value || ""} 
                      onChange={(e) => updateCostValue(item.id, Number(e.target.value))}
                      className="h-9 font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-sm text-muted-foreground block">Total Manual</span>
                <span className="text-3xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalManual)}
                </span>
              </div>
              
              <div className={`p-4 rounded-2xl flex items-center gap-4 ${isPackageCheaper ? 'bg-amber-50 text-amber-900 border border-amber-100' : 'bg-emerald-50 text-emerald-900 border border-emerald-100'}`}>
                <div className={`p-2 rounded-full ${isPackageCheaper ? 'bg-amber-200' : 'bg-emerald-200'}`}>
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider">Economia Estimada</span>
                  <div className="text-xl font-black">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(difference))}
                  </div>
                  <p className="text-[10px] opacity-80">
                    {isPackageCheaper ? 'O pacote da agência está compensando mais' : 'Reservar manualmente está compensando mais'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cronograma da Viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: daysCount }).map((_, index) => {
                const currentDate = addDays(new Date(startDate + 'T00:00:00'), index);
                const isFirstDay = index === 0;
                const isLastDay = index === daysCount - 1;
                
                let event = "Livre / Passeios";
                let status = <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase">Hospedagem</span>;
                
                if (isFirstDay) {
                  event = `Saída de ${origin} / Check-in ${destination ? `em ${destination}` : ""}`;
                  status = <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">Ida</span>;
                } else if (isLastDay) {
                  event = `Check-out / Retorno para ${origin}`;
                  status = <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold uppercase">Volta</span>;
                }

                return (
                  <TableRow key={index}>
                    <TableCell className="font-bold text-primary">Dia {index + 1}</TableCell>
                    <TableCell>
                      {format(currentDate, "dd 'de' MMM", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{event}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
