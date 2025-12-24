import { useState } from 'react';
import { 
  Building2, 
  Bell, 
  Shield, 
  Palette,
  Receipt,
  Save,
  Mail,
  Phone,
  MapPin,
  Users,
  Lock,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { demoHotel } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserManagement } from '@/components/settings/UserManagement';
import { PermissionsManagement } from '@/components/settings/PermissionsManagement';
import { useCurrency, CurrencyCode } from '@/contexts/CurrencyContext';
import { toast } from '@/hooks/use-toast';

type SettingsTab = 'general' | 'users' | 'permissions' | 'notifications' | 'security' | 'appearance' | 'billing';

const settingsTabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'Général', icon: Building2 },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'permissions', label: 'Permissions', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'billing', label: 'Facturation', icon: Receipt },
];

const Parametres = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hotelData, setHotelData] = useState(demoHotel);
  const { currency, setCurrency, availableCurrencies, formatCurrency } = useCurrency();

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as CurrencyCode);
    toast({
      title: "Devise mise à jour",
      description: `La devise a été changée en ${availableCurrencies.find(c => c.code === value)?.name}`,
    });
  };

  const handleSaveGeneral = () => {
    toast({
      title: "Paramètres enregistrés",
      description: "Les informations de l'hôtel ont été mises à jour",
    });
  };

  const handleSaveBilling = () => {
    toast({
      title: "Paramètres de facturation enregistrés",
      description: "Les paramètres de facturation ont été mis à jour",
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Informations de l'hôtel</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nom de l'hôtel</label>
                <Input 
                  value={hotelData.name}
                  onChange={(e) => setHotelData({ ...hotelData, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Catégorie</label>
                <Select 
                  value={hotelData.categoryStars.toString()}
                  onValueChange={(value) => setHotelData({ ...hotelData, categoryStars: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 étoile</SelectItem>
                    <SelectItem value="2">2 étoiles</SelectItem>
                    <SelectItem value="3">3 étoiles</SelectItem>
                    <SelectItem value="4">4 étoiles</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea 
                value={hotelData.description}
                onChange={(e) => setHotelData({ ...hotelData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </label>
                <Input 
                  type="email"
                  value={hotelData.email}
                  onChange={(e) => setHotelData({ ...hotelData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Téléphone
                </label>
                <Input 
                  type="tel"
                  value={hotelData.phone}
                  onChange={(e) => setHotelData({ ...hotelData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Adresse
              </label>
              <Input 
                value={hotelData.address}
                onChange={(e) => setHotelData({ ...hotelData, address: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                onClick={handleSaveGeneral}
              >
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        );

      case 'users':
        return <UserManagement />;

      case 'permissions':
        return <PermissionsManagement />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Préférences de notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configurez comment vous souhaitez recevoir les notifications.
            </p>
            
            <div className="space-y-4">
              {['Nouvelles réservations', 'Check-in/Check-out', 'Annulations', 'Paiements'].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">{item}</p>
                    <p className="text-sm text-muted-foreground">Recevoir une notification par email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Sécurité du compte</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Authentification à deux facteurs (2FA)</p>
                    <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire</p>
                  </div>
                  <Button variant="outline" onClick={() => toast({ title: "2FA", description: "Configuration 2FA à venir" })}>
                    Activer
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Changer le mot de passe</p>
                    <p className="text-sm text-muted-foreground">Dernière modification: il y a 3 mois</p>
                  </div>
                  <Button variant="outline" onClick={() => toast({ title: "Mot de passe", description: "Fonctionnalité à venir" })}>
                    Modifier
                  </Button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Sessions actives</p>
                    <p className="text-sm text-muted-foreground">2 appareils connectés</p>
                  </div>
                  <Button variant="outline" onClick={() => toast({ title: "Sessions", description: "Gestion des sessions à venir" })}>
                    Gérer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Apparence</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Logo de l'hôtel</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" onClick={() => toast({ title: "Logo", description: "Upload de logo à venir" })}>
                    Télécharger un logo
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Couleur principale</label>
                <div className="flex gap-3">
                  {['#1e3a5f', '#2563eb', '#059669', '#d97706', '#dc2626'].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all",
                        color === '#1e3a5f' ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => toast({ title: "Thème", description: "Personnalisation du thème à venir" })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Facturation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Devise</label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <div className="flex items-center justify-between gap-3">
                          <span>{curr.name} ({curr.code})</span>
                          {currency === curr.code && <Check className="w-4 h-4 text-accent" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Exemple: {formatCurrency(150000)}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Taux de TVA (%)</label>
                <Input type="number" defaultValue="20" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Préfixe numéro de facture</label>
              <Input defaultValue="FAC-2025-" />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                onClick={handleSaveBilling}
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Paramètres"
        subtitle="Gérez les paramètres de votre hôtel"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="gravity-card p-2 space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.id 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 gravity-card">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Parametres;
