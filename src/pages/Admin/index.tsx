import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HotelTenant } from "@/lib/hotel-context";
import { isAdmin } from "@/lib/admin-helpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Pencil, RefreshCw, Pause, Play, KeyRound, CreditCard, BarChart3, Users, Mail, StickyNote, Download, Trash2, MoreHorizontal } from "lucide-react";
interface HotelWithStats extends HotelTenant {
  nbRooms?: number;
  nbReservations?: number;
  nbClients?: number;
  nbAccounts?: number;
}

export default function AdminDashboard() {
  const [hotels, setHotels] = useState<HotelWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier l'accès admin au chargement de la page
    const checkAccess = async () => {
      const allowed = await isAdmin();
      if (!allowed) {
        toast({
          title: "Accès refusé",
          description: "Cette page est réservée aux administrateurs du SaaS.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }

      // Si admin, on peut charger les hôtels
      loadHotels();
    };

    void checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHotels() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement hôtels:", error);
        setHotels([]);
        return;
      }

      setHotels(data as HotelWithStats[]);
    } finally {
      setLoading(false);
    }
  }

  async function updateHotelStatus(id: string, statut: HotelTenant["statut"]) {
    const { error } = await supabase
      .from("hotels")
      .update({ statut })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour statut hôtel:", error);
      return;
    }

    setHotels((prev) => prev.map((h) => (h.id === id ? { ...h, statut } : h)));
  }

  async function updateHotelPlan(id: string, plan: HotelTenant["plan"]) {
    const prix_mensuel = plan === "basic" ? 50 : plan === "premium" ? 100 : 200;

    const { error } = await supabase
      .from("hotels")
      .update({ plan, prix_mensuel })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour plan hôtel:", error);
      return;
    }

    setHotels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, plan, prix_mensuel } : h))
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Dashboard Admin - Tous les hôtels clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date inscription</TableHead>
                  <TableHead>Prix/mois</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>{hotel.name}</TableCell>
                    <TableCell>{hotel.email}</TableCell>
                    <TableCell>
                      <select
                        className="border bg-background text-sm rounded px-2 py-1"
                        value={hotel.plan}
                        onChange={(e) =>
                          updateHotelPlan(
                            hotel.id,
                            e.target.value as HotelTenant["plan"]
                          )
                        }
                      >
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          hotel.statut === "actif"
                            ? "default"
                            : hotel.statut === "trial"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {hotel.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hotel.date_abonnement
                        ? new Date(hotel.date_abonnement).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{Number(hotel.prix_mensuel || 0)}€</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[220px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => console.log("Voir détails", hotel.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Voir détails</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Modifier", hotel.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Changer de plan", hotel.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Changer de plan</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateHotelStatus(
                                hotel.id,
                                hotel.statut === "suspendu" ? "actif" : "suspendu"
                              )
                            }
                          >
                            {hotel.statut === "suspendu" ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                <span>Réactiver</span>
                              </>
                            ) : (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                <span>Suspendre</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Se connecter en tant que", hotel.id)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            <span>Se connecter en tant que</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Gérer l'abonnement", hotel.id)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Gérer l'abonnement</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Voir statistiques", hotel.id)}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span>Voir statistiques</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Gérer utilisateurs", hotel.id)}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Gérer utilisateurs</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Envoyer email", hotel.id)}>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Envoyer email</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Notes internes", hotel.id)}>
                            <StickyNote className="mr-2 h-4 w-4" />
                            <span>Notes internes</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Exporter données", hotel.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Exporter données</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => console.log("Supprimer (double confirmation à implémenter)", hotel.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Supprimer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
