import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

import Layout from '@/components/Layout';
import Landing from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import Course from '@/pages/course';
import Community from '@/pages/community';
import Meals from '@/pages/meals';
import Evolution from '@/pages/evolution';
import Exercises from '@/pages/exercises';
import Reflection from '@/pages/reflection';
import Calculadora from '@/pages/calculadora';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-neutral-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/course" element={<ProtectedRoute><Layout><Course /></Layout></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Layout><Community /></Layout></ProtectedRoute>} />
            <Route path="/meals" element={<ProtectedRoute><Layout><Meals /></Layout></ProtectedRoute>} />
            <Route path="/evolution" element={<ProtectedRoute><Layout><Evolution /></Layout></ProtectedRoute>} />
            <Route path="/exercises" element={<ProtectedRoute><Layout><Exercises /></Layout></ProtectedRoute>} />
            <Route path="/reflection" element={<ProtectedRoute><Layout><Reflection /></Layout></ProtectedRoute>} />
            <Route path="/calculadora" element={<ProtectedRoute><Layout><Calculadora /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default App;