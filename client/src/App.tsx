import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="meals" element={<Meals />} />
              <Route path="evolution" element={<Evolution />} />
              <Route path="reflection" element={<Reflection />} />
              <Route path="course" element={<Course />} />
              <Route path="community" element={<Community />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="calculadora" element={<Calculadora />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;