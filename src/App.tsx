import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Chambres from "./pages/Chambres";
import Reservations from "./pages/Reservations";
import Clients from "./pages/Clients";
import Utilisateurs from "./pages/Utilisateurs";
import Statistiques from "./pages/Statistiques";
import Parametres from "./pages/Parametres";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chambres" element={<Chambres />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/parametres" element={<Parametres />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
