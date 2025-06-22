import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import Layout from "@/components/Layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Meals from "@/pages/meals";
import Evolution from "@/pages/evolution";
import Reflection from "@/pages/reflection";
import Course from "@/pages/course";
import Community from "@/pages/community";
import Exercises from "@/pages/exercises";
import Calculadora from "@/pages/calculadora";
import NotFound from "@/pages/not-found";

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Switch>
            <Route path="/">
              <Landing />
            </Route>
            <Route path="/app/:rest*">
              <Layout>
                <Switch>
                  <Route path="/app/dashboard">
                    <Dashboard />
                  </Route>
                  <Route path="/app/meals">
                    <Meals />
                  </Route>
                  <Route path="/app/evolution">
                    <Evolution />
                  </Route>
                  <Route path="/app/reflection">
                    <Reflection />
                  </Route>
                  <Route path="/app/course">
                    <Course />
                  </Route>
                  <Route path="/app/community">
                    <Community />
                  </Route>
                  <Route path="/app/exercises">
                    <Exercises />
                  </Route>
                  <Route path="/app/calculadora">
                    <Calculadora />
                  </Route>
                  <Route path="/app">
                    <Dashboard />
                  </Route>
                </Switch>
              </Layout>
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;