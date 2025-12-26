import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HotelTenant } from "@/lib/hotel-context";

interface HotelWithStats extends HotelTenant {
  nbRooms?: number;
  nbReservations?: number;
  nbClients?: number;
  nbAccounts?: number;
}

export default function AdminDashboard() {
  const [hotels, setHotels] = useState<HotelWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotels();
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
                    <TableCell className="space-x-2">
                      {hotel.statut !== "suspendu" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateHotelStatus(hotel.id, "suspendu")}
                        >
                          Suspendre
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateHotelStatus(hotel.id, "actif")}
                        >
                          Activer
                        </Button>
                      )}
                      {hotel.statut === "trial" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateHotelStatus(hotel.id, "actif")}
                        >
                          Passer en actif
                        </Button>
                      )}
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
