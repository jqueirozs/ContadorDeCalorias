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
import Sidebar from "@/components/Sidebar"; // Import Sidebar

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/curso" component={Course} />
          <Route path="/comunidade" component={Community} />
          <Route path="/exercicios" component={Exercises} />
          <Route path="/espelho" component={Reflection} />
          <Route path="/refeicoes" component={Meals} />
          <Route path="/evolucao" component={Evolution} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-6">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/curso" component={Course} />
                <Route path="/comunidade" component={Community} />
                <Route path="/exercicios" component={Exercises} />
                <Route path="/espelho" component={Reflection} />
                <Route path="/refeicoes" component={Meals} />
                <Route path="/evolucao" component={Evolution} />
                <Route component={NotFound} />
              </Switch>
            </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;