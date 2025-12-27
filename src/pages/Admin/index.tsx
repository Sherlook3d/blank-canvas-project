import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HotelTenant } from "@/lib/hotel-context";
import { isAdmin, logAdminAction } from "@/lib/admin-helpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [selectedHotel, setSelectedHotel] = useState<HotelWithStats | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planDraft, setPlanDraft] = useState<HotelTenant["plan"]>("basic");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<HotelTenant["statut"] | null>(null);
  const [pendingStatusHotel, setPendingStatusHotel] = useState<HotelWithStats | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelEmail, setNewHotelEmail] = useState("");
  const [newHotelPlan, setNewHotelPlan] = useState<HotelTenant["plan"]>("basic");
  const [createError, setCreateError] = useState<string | null>(null);
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
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'hôtel.",
        variant: "destructive",
      });
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
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le plan de l'hôtel.",
        variant: "destructive",
      });
      return;
    }

    setHotels((prev) =>
      prev.map((h) => (h.id === id ? { ...h, plan, prix_mensuel } : h))
    );
  }

  const newHotelSchema = z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Le nom de l'hôtel est obligatoire" })
      .max(120, { message: "Nom trop long" }),
    email: z
      .string()
      .trim()
      .email({ message: "Email invalide" })
      .max(255, { message: "Email trop long" })
      .optional()
      .or(z.literal("")),
    plan: z.enum(["basic", "premium", "enterprise"]),
  });

  async function handleCreateHotel() {
    setCreateError(null);

    const parsed = newHotelSchema.safeParse({
      name: newHotelName,
      email: newHotelEmail,
      plan: newHotelPlan,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Données invalides";
      toast({ title: "Formulaire incomplet", description: msg, variant: "destructive" });
      setCreateError(msg);
      return;
    }

    const prix_mensuel =
      parsed.data.plan === "basic" ? 50 : parsed.data.plan === "premium" ? 100 : 200;

    const { data, error } = await supabase
      .from("hotels")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email || null,
        plan: parsed.data.plan,
        prix_mensuel,
        statut: "actif",
        module_finances: true,
        module_statistiques: true,
        module_facturation: false,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erreur création hôtel:", error);
      const baseMessage =
        error.message || error.hint || "Impossible de créer l'hôtel (erreur serveur).";
      const details = error.details || error.code || null;
      const fullMessage = details ? `${baseMessage} (${details})` : baseMessage;

      toast({
        title: "Erreur",
        description: fullMessage,
        variant: "destructive",
      });
      setCreateError(fullMessage);
      return;
    }

    setHotels((prev) => [{ ...(data as HotelWithStats) }, ...prev]);
    setAddDialogOpen(false);
    setNewHotelName("");
    setNewHotelEmail("");
    setNewHotelPlan("basic");
    setCreateError(null);

    toast({
      title: "Hôtel créé",
      description: "Le nouvel hôtel a été ajouté au dashboard.",
    });

    void logAdminAction({
      action: "hotel.create",
      actionLabel: "Création d'un hôtel",
      targetHotelId: (data as { id: string }).id,
      targetHotelName: (data as { name?: string }).name ?? parsed.data.name,
      details: {
        plan: parsed.data.plan,
        prix_mensuel,
        email: parsed.data.email || null,
      },
    });
  }

  async function handleConfirmPlanChange() {
    if (!selectedHotel) return;
    const previousPlan = selectedHotel.plan;
    await updateHotelPlan(selectedHotel.id, planDraft);
    toast({
      title: "Plan mis à jour",
      description: `Le plan de ${selectedHotel.name} est maintenant ${planDraft}.`,
    });

    void logAdminAction({
      action: "hotel.plan_change",
      actionLabel: "Changement de plan de l'hôtel",
      targetHotelId: selectedHotel.id,
      targetHotelName: selectedHotel.name,
      details: {
        from_plan: previousPlan,
        to_plan: planDraft,
      },
    });

    setPlanDialogOpen(false);
    setSelectedHotel(null);
  }

  async function handleConfirmStatusChange() {
    if (!pendingStatusHotel || !pendingStatus) return;
    const previousStatus = pendingStatusHotel.statut;
    await updateHotelStatus(pendingStatusHotel.id, pendingStatus);
    toast({
      title: pendingStatus === "suspendu" ? "Hôtel suspendu" : "Hôtel réactivé",
      description: `${pendingStatusHotel.name} est maintenant ${pendingStatus}.`,
    });

    void logAdminAction({
      action: "hotel.status_change",
      actionLabel: "Changement de statut de l'hôtel",
      targetHotelId: pendingStatusHotel.id,
      targetHotelName: pendingStatusHotel.name,
      details: {
        from_status: previousStatus,
        to_status: pendingStatus,
      },
    });

    setStatusDialogOpen(false);
    setPendingStatus(null);
    setPendingStatusHotel(null);
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
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Dashboard Admin - Tous les hôtels clients</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/admins")}>
              Administration des admins
            </Button>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              + Ajouter un hôtel
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setPlanDraft(hotel.plan);
                              setPlanDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Changer de plan</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const nextStatus: HotelTenant["statut"] =
                                hotel.statut === "suspendu" ? "actif" : "suspendu";
                              setPendingStatusHotel(hotel);
                              setPendingStatus(nextStatus);
                              setStatusDialogOpen(true);
                            }}
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

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel hôtel</DialogTitle>
            <DialogDescription>
              Ce formulaire crée un hôtel minimal (nom, email, plan). On étendra les champs ensuite.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="hotel-name">Nom de l'hôtel</Label>
              <Input
                id="hotel-name"
                value={newHotelName}
                onChange={(e) => setNewHotelName(e.target.value)}
                placeholder="Ex : Hôtel Océan Bleu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-email">Email de contact</Label>
              <Input
                id="hotel-email"
                type="email"
                value={newHotelEmail}
                onChange={(e) => setNewHotelEmail(e.target.value)}
                placeholder="contact@hotel.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-plan">Plan</Label>
              <select
                id="hotel-plan"
                className="border bg-background text-sm rounded px-2 py-1 w-full"
                value={newHotelPlan}
                onChange={(e) => setNewHotelPlan(e.target.value as HotelTenant["plan"])}
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            {createError && (
              <Alert variant="destructive">
                <AlertTitle>Erreur lors de la création</AlertTitle>
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateHotel}>Créer l'hôtel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le plan</DialogTitle>
            <DialogDescription>
              Sélectionne un nouveau plan pour cet hôtel. Ce modal est un placeholder, on affinera la logique plus tard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="text-sm text-muted-foreground">
              Hôtel : <span className="font-medium text-foreground">{selectedHotel?.name}</span>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Nouveau plan</span>
              <select
                className="border bg-background text-sm rounded px-2 py-1"
                value={planDraft}
                onChange={(e) => setPlanDraft(e.target.value as HotelTenant["plan"])}
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPlanChange}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "suspendu" ? "Suspendre l'hôtel ?" : "Réactiver l'hôtel ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "suspendu"
                ? "L'hôtel sera mis en pause. Les utilisateurs ne pourront plus s'y connecter."
                : "L'hôtel sera à nouveau actif pour ses utilisateurs."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

