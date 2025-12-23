import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HotelProvider } from "@/contexts/HotelContext";
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
        <HotelProvider>
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
                <Route path="/" element={
                  <ProtectedRoute pageKey="dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/chambres" element={
                  <ProtectedRoute pageKey="chambres">
                    <Chambres />
                  </ProtectedRoute>
                } />
                <Route path="/reservations" element={
                  <ProtectedRoute pageKey="reservations">
                    <Reservations />
                  </ProtectedRoute>
                } />
                <Route path="/clients" element={
                  <ProtectedRoute pageKey="clients">
                    <Clients />
                  </ProtectedRoute>
                } />
                <Route path="/statistiques" element={
                  <ProtectedRoute pageKey="statistiques">
                    <Statistiques />
                  </ProtectedRoute>
                } />
                <Route path="/utilisateurs" element={
                  <ProtectedRoute pageKey="utilisateurs">
                    <Utilisateurs />
                  </ProtectedRoute>
                } />
                <Route path="/parametres" element={
                  <ProtectedRoute pageKey="parametres">
                    <Parametres />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HotelProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
