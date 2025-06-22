import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Course from "@/pages/course";
import Community from "@/pages/community";
import Exercises from "@/pages/exercises";
import Reflection from "@/pages/reflection";
import Meals from "@/pages/meals";
import Evolution from "@/pages/evolution";
import Calculadora from "@/pages/calculadora";
import Sidebar from "@/components/layout/sidebar";
import ThemeToggle from "@/components/ThemeToggle";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Route path="/" component={Landing} />;
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <Sidebar />
      <ThemeToggle />
      <main className="flex-1 lg:pl-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/curso" component={Course} />
          <Route path="/comunidade" component={Community} />
          <Route path="/exercicios" component={Exercises} />
          <Route path="/espelho" component={Reflection} />
          <Route path="/calculadora" component={Calculadora} />
          <Route path="/refeicoes" component={Meals} />
          <Route path="/evolucao" component={Evolution} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;