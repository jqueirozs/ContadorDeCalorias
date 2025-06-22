import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

import { Layout } from '@/components/Layout';
import Dashboard from '@/pages/dashboard';
import Course from '@/pages/Course';
import Community from '@/pages/Community';
import Meals from '@/pages/meals';
import Evolution from '@/pages/evolution';
import Exercises from '@/pages/exercises';
import Reflection from '@/pages/reflection';
import Calculadora from '@/pages/calculadora';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Switch>
        <Route path="/" component={LandingRedirect} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/course">
          <ProtectedRoute>
            <Layout>
              <Course />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/community">
          <ProtectedRoute>
            <Layout>
              <Community />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/meals">
          <ProtectedRoute>
            <Layout>
              <Meals />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/evolution">
          <ProtectedRoute>
            <Layout>
              <Evolution />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/exercises">
          <ProtectedRoute>
            <Layout>
              <Exercises />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/reflection">
          <ProtectedRoute>
            <Layout>
              <Reflection />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route path="/calculadora">
          <ProtectedRoute>
            <Layout>
              <Calculadora />
            </Layout>
          </ProtectedRoute>
        </Route>
        <Route>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Página não encontrada</h1>
              <p className="text-gray-600">A página que você está procurando não existe.</p>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

function LandingRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setLocation('/dashboard');
      } else {
        window.location.href = '/api/login';
      }
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;