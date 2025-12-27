import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { isAdmin } from "@/lib/admin-helpers";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccessAndLoad = async () => {
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

      await loadAdmins();
    };

    void checkAccessAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAdmins() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement admin_users:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des administrateurs.",
          variant: "destructive",
        });
        setAdmins([]);
        return;
      }

      setAdmins(data as AdminUser[]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(admin: AdminUser) {
    const next = !admin.actif;
    setUpdatingId(admin.id);

    const { error } = await supabase
      .from("admin_users")
      .update({ actif: next })
      .eq("id", admin.id);

    if (error) {
      console.error("Erreur mise à jour admin_users.actif:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'administrateur.",
        variant: "destructive",
      });
      setUpdatingId(null);
      return;
    }

    setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, actif: next } : a)));
    setUpdatingId(null);

    toast({
      title: next ? "Administrateur activé" : "Administrateur suspendu",
      description: `${admin.prenom ?? ""} ${admin.nom ?? ""} (${admin.email}) est maintenant ${
        next ? "actif" : "suspendu"
      }`,
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Chargement des administrateurs...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Administration des admins SaaS</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gère l'activation ou la suspension des comptes administrateurs de la plateforme.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            Retour au dashboard admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      {admin.prenom || admin.nom ? (
                        <span className="font-medium">{`${admin.prenom ?? ""} ${admin.nom ?? ""}`.trim()}</span>
                      ) : (
                        <span className="text-muted-foreground">(Sans nom)</span>
                      )}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{admin.role ?? "admin"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.actif ? "default" : "destructive"}>
                        {admin.actif ? "Actif" : "Suspendu"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {admin.can_view_finances && <Badge variant="secondary">Finances</Badge>}
                        {admin.can_create_hotels && <Badge variant="secondary">Création hôtels</Badge>}
                        {admin.can_delete_hotels && <Badge variant="secondary">Suppression hôtels</Badge>}
                        {admin.can_impersonate && <Badge variant="secondary">Impersonation</Badge>}
                        {!admin.can_view_finances &&
                          !admin.can_create_hotels &&
                          !admin.can_delete_hotels &&
                          !admin.can_impersonate && (
                            <span className="text-muted-foreground">Aucune permission spéciale</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.derniere_connexion
                        ? new Date(admin.derniere_connexion).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs text-muted-foreground">
                          {admin.actif ? "Actif" : "Suspendu"}
                        </span>
                        <Switch
                          checked={!!admin.actif}
                          disabled={updatingId === admin.id}
                          onCheckedChange={() => void toggleActive(admin)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                      Aucun administrateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
