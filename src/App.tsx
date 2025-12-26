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
                  {/* Routes publiques conservées pour plus tard si besoin */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/setup" element={<Setup />} />

                  {/* Routes sans protection d'authentification (aperçu direct) */}
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chambres" element={<Chambres />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/comptes" element={<Comptes />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/statistiques" element={<Statistiques />} />
                    <Route path="/finances" element={<Finances />} />
                    <Route path="/utilisateurs" element={<Utilisateurs />} />
                    <Route path="/parametres" element={<Parametres />} />
                  </Route>

                  {/* Page contact publique et 404 */}
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
