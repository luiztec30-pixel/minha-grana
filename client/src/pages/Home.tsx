import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  ArrowLeftRight, 
  PiggyBank, 
  Calculator,
  Plane,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Sub-components/Views
import { DashboardView } from "./views/DashboardView";
import { IncomesView } from "./views/IncomesView";
import { FixedExpensesView } from "./views/FixedExpensesView";
import { VariableExpensesView } from "./views/VariableExpensesView";
import { SavingsView } from "./views/SavingsView";
import { MotoDetailsView } from "./views/MotoDetailsView";
import { TravelPlanningView } from "./views/TravelPlanningView";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Minha Grana
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                {user?.username}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Usuário Ativo
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-800">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logoutMutation.mutate()}
                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 cursor-pointer"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? "Saindo..." : "Sair do Sistema"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 h-auto shadow-sm min-w-[600px]">
              <TabsTrigger value="dashboard" className="gap-2 px-4 py-2.5">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="incomes" className="gap-2 px-4 py-2.5">
                <ArrowLeftRight className="w-4 h-4" /> Receitas
              </TabsTrigger>
              <TabsTrigger value="fixed" className="gap-2 px-4 py-2.5">
                <Receipt className="w-4 h-4" /> Fixos
              </TabsTrigger>
              <TabsTrigger value="variable" className="gap-2 px-4 py-2.5">
                <Wallet className="w-4 h-4" /> Variáveis
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-2 px-4 py-2.5">
                <PiggyBank className="w-4 h-4" /> Metas
              </TabsTrigger>
              <TabsTrigger value="moto" className="gap-2 px-4 py-2.5">
                <Calculator className="w-4 h-4" /> Financiamento
              </TabsTrigger>
              <TabsTrigger value="travel" className="gap-2 px-4 py-2.5">
                <Plane className="w-4 h-4" /> Viagem
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="focus-visible:outline-none">
            <DashboardView />
          </TabsContent>
          
          <TabsContent value="incomes" className="focus-visible:outline-none">
            <IncomesView />
          </TabsContent>
          
          <TabsContent value="fixed" className="focus-visible:outline-none">
            <FixedExpensesView />
          </TabsContent>
          
          <TabsContent value="variable" className="focus-visible:outline-none">
            <VariableExpensesView />
          </TabsContent>
          
          <TabsContent value="savings" className="focus-visible:outline-none">
            <SavingsView />
          </TabsContent>
          
          <TabsContent value="moto" className="focus-visible:outline-none">
            <MotoDetailsView />
          </TabsContent>

          <TabsContent value="travel" className="focus-visible:outline-none">
            <TravelPlanningView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
