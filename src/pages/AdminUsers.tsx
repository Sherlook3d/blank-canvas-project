import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isAdmin } from "@/lib/admin-helpers";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

const adminFormSchema = z.object({
  user_id: z
    .string()
    .trim()
    .uuid({ message: "ID utilisateur (UUID) invalide" }),
  email: z
    .string()
    .trim()
    .email({ message: "Email invalide" })
    .max(255, { message: "Email trop long" }),
  prenom: z
    .string()
    .trim()
    .max(120, { message: "Prénom trop long" })
    .optional()
    .or(z.literal("")),
  nom: z
    .string()
    .trim()
    .max(120, { message: "Nom trop long" })
    .optional()
    .or(z.literal("")),
  role: z
    .string()
    .trim()
    .max(50, { message: "Rôle trop long" })
    .default("admin"),
  actif: z.boolean().default(true),
  can_view_finances: z.boolean().default(true),
  can_create_hotels: z.boolean().default(true),
  can_delete_hotels: z.boolean().default(false),
  can_impersonate: z.boolean().default(false),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formValues, setFormValues] = useState<AdminFormValues | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

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

  function openCreateDialog() {
    setEditingAdmin(null);
    setFormValues({
      user_id: "",
      email: "",
      prenom: "",
      nom: "",
      role: "admin",
      actif: true,
      can_view_finances: true,
      can_create_hotels: true,
      can_delete_hotels: false,
      can_impersonate: false,
    });
    setFormDialogOpen(true);
  }

  function openEditDialog(admin: AdminUser) {
    setEditingAdmin(admin);
    setFormValues({
      user_id: admin.user_id,
      email: admin.email,
      prenom: admin.prenom ?? "",
      nom: admin.nom ?? "",
      role: admin.role ?? "admin",
      actif: admin.actif ?? true,
      can_view_finances: admin.can_view_finances ?? true,
      can_create_hotels: admin.can_create_hotels ?? true,
      can_delete_hotels: admin.can_delete_hotels ?? false,
      can_impersonate: admin.can_impersonate ?? false,
    });
    setFormDialogOpen(true);
  }

  async function handleSubmitForm() {
    if (!formValues) return;

    const parsed = adminFormSchema.safeParse(formValues);

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Données invalides";
      toast({
        title: "Formulaire incomplet",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setFormSubmitting(true);

    try {
      if (editingAdmin) {
        const { error } = await supabase
          .from("admin_users")
          .update({
            email: parsed.data.email,
            prenom: parsed.data.prenom || null,
            nom: parsed.data.nom || null,
            role: parsed.data.role || "admin",
            actif: parsed.data.actif,
            can_view_finances: parsed.data.can_view_finances,
            can_create_hotels: parsed.data.can_create_hotels,
            can_delete_hotels: parsed.data.can_delete_hotels,
            can_impersonate: parsed.data.can_impersonate,
          })
          .eq("id", editingAdmin.id);

        if (error) {
          console.error("Erreur mise à jour admin_user:", error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour l'administrateur.",
            variant: "destructive",
          });
          return;
        }

        setAdmins((prev) =>
          prev.map((a) =>
            a.id === editingAdmin.id
              ? {
                  ...a,
                  email: parsed.data.email,
                  prenom: parsed.data.prenom || null,
                  nom: parsed.data.nom || null,
                  role: parsed.data.role || "admin",
                  actif: parsed.data.actif,
                  can_view_finances: parsed.data.can_view_finances,
                  can_create_hotels: parsed.data.can_create_hotels,
                  can_delete_hotels: parsed.data.can_delete_hotels,
                  can_impersonate: parsed.data.can_impersonate,
                }
              : a
          )
        );

        toast({
          title: "Administrateur mis à jour",
          description: `${parsed.data.email} a été mis à jour.`,
        });
      } else {
        const { data, error } = await supabase
          .from("admin_users")
          .insert({
            user_id: parsed.data.user_id,
            email: parsed.data.email,
            prenom: parsed.data.prenom || null,
            nom: parsed.data.nom || null,
            role: parsed.data.role || "admin",
            actif: parsed.data.actif,
            can_view_finances: parsed.data.can_view_finances,
            can_create_hotels: parsed.data.can_create_hotels,
            can_delete_hotels: parsed.data.can_delete_hotels,
            can_impersonate: parsed.data.can_impersonate,
          })
          .select("*")
          .single();

        if (error) {
          console.error("Erreur création admin_user:", error);
          toast({
            title: "Erreur",
            description: "Impossible de créer l'administrateur.",
            variant: "destructive",
          });
          return;
        }

        setAdmins((prev) => [data as AdminUser, ...prev]);

        toast({
          title: "Administrateur créé",
          description: `${parsed.data.email} a été ajouté comme admin.`,
        });
      }

      setFormDialogOpen(false);
      setEditingAdmin(null);
      setFormValues(null);
    } finally {
      setFormSubmitting(false);
    }
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
              Gère l'activation, la suspension et la configuration des comptes administrateurs de la plateforme.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
              Retour au dashboard admin
            </Button>
            <Button size="sm" onClick={openCreateDialog}>
              + Nouvel admin
            </Button>
          </div>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(admin)}
                        >
                          Éditer
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {admin.actif ? "Actif" : "Suspendu"}
                          </span>
                          <Switch
                            checked={!!admin.actif}
                            disabled={updatingId === admin.id}
                            onCheckedChange={() => void toggleActive(admin)}
                          />
                        </div>
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

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Modifier un administrateur" : "Créer un nouvel administrateur"}
            </DialogTitle>
            <DialogDescription>
              Renseigne les informations de l'administrateur. L'ID utilisateur doit correspondre à l'UUID de
              l'utilisateur dans Supabase Auth.
            </DialogDescription>
          </DialogHeader>

          {formValues && (
            <div className="space-y-4 py-2">
              {!editingAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="user-id">ID utilisateur (UUID)</Label>
                  <Input
                    id="user-id"
                    value={formValues.user_id}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        user_id: e.target.value.trim(),
                      })
                    }
                    placeholder="Copie l'UUID depuis Auth &gt; Users"
                  />
                </div>
              )}
              {editingAdmin && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">ID utilisateur</span>
                  <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs break-all">
                    {editingAdmin.user_id}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      email: e.target.value.trim(),
                    })
                  }
                  placeholder="admin@hotel.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-prenom">Prénom</Label>
                  <Input
                    id="admin-prenom"
                    value={formValues.prenom ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        prenom: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-nom">Nom</Label>
                  <Input
                    id="admin-nom"
                    value={formValues.nom ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        nom: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-role">Rôle (libre)</Label>
                <Input
                  id="admin-role"
                  value={formValues.role}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      role: e.target.value.trim(),
                    })
                  }
                  placeholder="admin, support, super_admin..."
                />
              </div>

              <div className="space-y-3">
                <span className="text-sm font-medium text-foreground">Permissions</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                    <span>Actif</span>
                    <Switch
                      checked={formValues.actif}
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          actif: checked,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                    <span>Peut voir les finances</span>
                    <Switch
                      checked={formValues.can_view_finances}
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          can_view_finances: checked,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                    <span>Peut créer des hôtels</span>
                    <Switch
                      checked={formValues.can_create_hotels}
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          can_create_hotels: checked,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2">
                    <span>Peut supprimer des hôtels</span>
                    <Switch
                      checked={formValues.can_delete_hotels}
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          can_delete_hotels: checked,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 md:col-span-2">
                    <span>Peut s'identifier à la place d'un utilisateur (impersonation)</span>
                    <Switch
                      checked={formValues.can_impersonate}
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          can_impersonate: checked,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (formSubmitting) return;
                setFormDialogOpen(false);
                setEditingAdmin(null);
                setFormValues(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={() => void handleSubmitForm()} disabled={formSubmitting || !formValues}>
              {formSubmitting
                ? editingAdmin
                  ? "Enregistrement..."
                  : "Création..."
                : editingAdmin
                  ? "Enregistrer"
                  : "Créer l'administrateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
