import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getHotelStats, HotelTenant } from "@/lib/hotel-context";

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

      // Pour l'instant, on affiche la liste brute sans recalculer les stats pour chaque hôtel
      setHotels(data as HotelWithStats[]);
    } finally {
      setLoading(false);
    }
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>{hotel.name}</TableCell>
                    <TableCell>{hotel.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{hotel.plan}</Badge>
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
                        ? new Date(hotel.date_abonnement as unknown as string).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{Number(hotel.prix_mensuel || 0)}€</TableCell>
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
