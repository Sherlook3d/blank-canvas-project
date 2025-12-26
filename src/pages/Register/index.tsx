import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerHotel } from "@/lib/hotel-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotelName: "",
    hotelAddress: "",
    hotelEmail: "",
    hotelPhone: "",
    adminEmail: "",
    adminPassword: "",
    adminName: "",
    plan: "basic" as "basic" | "premium" | "enterprise",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await registerHotel(formData);

    if (result.success) {
      alert("✅ " + result.message);
      navigate("/auth");
    } else {
      alert("❌ Erreur : " + result.error);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">
            Inscription HotelManager SaaS
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Créez votre compte et commencez votre essai gratuit de 14 jours
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Infos Hôtel */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Informations de l'hôtel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hotel-name">Nom de l'hôtel *</Label>
                  <Input
                    id="hotel-name"
                    value={formData.hotelName}
                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                    placeholder="Hôtel Paradise"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hotel-address">Adresse</Label>
                  <Input
                    id="hotel-address"
                    value={formData.hotelAddress}
                    onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                    placeholder="123 Avenue Principale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-email">Email</Label>
                  <Input
                    id="hotel-email"
                    type="email"
                    value={formData.hotelEmail}
                    onChange={(e) => setFormData({ ...formData, hotelEmail: e.target.value })}
                    placeholder="contact@hotel.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-phone">Téléphone</Label>
                  <Input
                    id="hotel-phone"
                    value={formData.hotelPhone}
                    onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                    placeholder="+261 34 00 000 00"
                  />
                </div>
              </div>
            </section>

            {/* Infos Administrateur */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Compte administrateur</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="admin-name">Nom complet *</Label>
                  <Input
                    id="admin-name"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email *</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@hotel.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mot de passe *</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </section>

            {/* Choix du plan */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Choisissez votre plan</h2>
              <Select
                value={formData.plan}
                onValueChange={(v: "basic" | "premium" | "enterprise") =>
                  setFormData({ ...formData, plan: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">Basic - 50€/mois</span>
                      <span className="text-xs text-muted-foreground">
                        20 chambres max, 3 utilisateurs
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">Premium - 100€/mois</span>
                      <span className="text-xs text-muted-foreground">
                        50 chambres max, 10 utilisateurs
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">Enterprise - 200€/mois</span>
                      <span className="text-xs text-muted-foreground">Illimité</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Inscription en cours..." : "S'inscrire et commencer l'essai"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                14 jours d'essai gratuit. Aucune carte bancaire requise.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
