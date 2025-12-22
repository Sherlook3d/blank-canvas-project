import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Chambres from "./pages/Chambres";
import Reservations from "./pages/Reservations";
import Clients from "./pages/Clients";
import Utilisateurs from "./pages/Utilisateurs";
import Statistiques from "./pages/Statistiques";
import Parametres from "./pages/Parametres";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chambres" element={<Chambres />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/clients" element={<Clients />} />
              
              {/* Manager & Owner only */}
              <Route path="/statistiques" element={
                <ProtectedRoute allowedRoles={['owner', 'manager']}>
                  <Statistiques />
                </ProtectedRoute>
              } />
              
              {/* Owner only */}
              <Route path="/utilisateurs" element={
                <ProtectedRoute allowedRoles={['owner', 'manager']}>
                  <Utilisateurs />
                </ProtectedRoute>
              } />
              
              <Route path="/parametres" element={
                <ProtectedRoute allowedRoles={['owner', 'manager']}>
                  <Parametres />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
