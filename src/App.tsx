import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HotelProvider } from "@/contexts/HotelContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SetupRoute } from "@/components/auth/SetupRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Chambres from "./pages/Chambres";
import Reservations from "./pages/Reservations";
import Comptes from "./pages/Comptes";
import Clients from "./pages/Clients";
import Utilisateurs from "./pages/Utilisateurs";
import Statistiques from "./pages/Statistiques";
import Parametres from "./pages/Parametres";
import Finances from "./pages/Finances";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import RegisterPage from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <HotelProvider>
            <CurrencyProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/setup"
                    element={
                      <SetupRoute>
                        <Setup />
                      </SetupRoute>
                    }
                  />
                  
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
                    <Route path="/comptes" element={
                      <ProtectedRoute pageKey="comptes">
                        <Comptes />
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
                    <Route path="/finances" element={
                      <ProtectedRoute pageKey="finances">
                        <Finances />
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
                  
                  {/* Public contact page */}
                  <Route path="/contact" element={<Contact />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </CurrencyProvider>
          </HotelProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
