import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Redirect } from "wouter";
import { Bike, Wallet, TrendingUp } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Bem-vindo ao Minha Grana</CardTitle>
            <CardDescription>
              Gerencie suas finanças de forma simples e eficiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input id="username" {...loginForm.register("username")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" {...loginForm.register("password")} required />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Usuário</Label>
                    <Input id="reg-username" {...registerForm.register("username")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <Input id="reg-password" type="password" {...registerForm.register("password")} required />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-center space-y-8">
          <div className="flex justify-center gap-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <Wallet className="w-12 h-12 text-primary" />
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <Bike className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <TrendingUp className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Assuma o controle total do seu dinheiro.</h1>
            <p className="text-slate-400 text-lg">
              Acompanhe receitas, gastos fixos, variáveis e planeje a compra da sua moto em um só lugar. Simples, rápido e seguro.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Metas</p>
              <p className="text-xs text-slate-400">Defina objetivos de economia mensais.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-bold text-emerald-400 mb-1 uppercase tracking-wider">Moto</p>
              <p className="text-xs text-slate-400">Simule financiamentos e acompanhe parcelas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
