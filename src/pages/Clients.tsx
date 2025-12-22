import { useState } from 'react';
import { Plus, Search, Star, Mail, Phone, MoreVertical, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { useHotel, Client } from '@/contexts/HotelContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vip: false,
  });
  const { clients, isLoading, addClient } = useHotel();

  const vipCount = clients.filter(c => c.vip).length;

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVip = !showVipOnly || client.vip;
    
    return matchesSearch && matchesVip;
  });

  const handleAddClient = async () => {
    const result = await addClient({
      first_name: newClient.first_name,
      last_name: newClient.last_name,
      email: newClient.email || null,
      phone: newClient.phone || null,
      address: null,
      id_type: null,
      id_number: null,
      nationality: null,
      notes: null,
      vip: newClient.vip,
    });
    
    if (result) {
      setShowAddClient(false);
      setNewClient({ first_name: '', last_name: '', email: '', phone: '', vip: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Fichier clients"
        subtitle={`${clients.length} clients • ${vipCount} VIP`}
        actions={
          <Button 
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={() => setShowAddClient(true)}
          >
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        }
      />

      {/* Add Client Dialog */}
      <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un client</DialogTitle>
            <DialogDescription>Créer une nouvelle fiche client</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={newClient.first_name}
                  onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                  placeholder="Jean"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={newClient.last_name}
                  onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                  placeholder="Dupont"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="jean.dupont@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="vip"
                checked={newClient.vip}
                onChange={(e) => setNewClient({ ...newClient, vip: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="vip" className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent" />
                Client VIP
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddClient(false)}>Annuler</Button>
            <Button onClick={handleAddClient} disabled={!newClient.first_name || !newClient.last_name}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search and Filters */}
      <div className="gravity-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <button
            onClick={() => setShowVipOnly(!showVipOnly)}
            className={cn(
              'filter-pill flex items-center gap-2',
              showVipOnly && 'filter-pill-active'
            )}
          >
            <Star className={cn("w-4 h-4", showVipOnly && "fill-current")} />
            Clients VIP
          </button>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filteredClients.map((client) => (
          <div key={client.id} className="client-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-hotel-orange-light flex items-center justify-center text-sm font-semibold text-accent">
                  {client.first_name[0]}{client.last_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {client.first_name} {client.last_name}
                    </h3>
                    {client.vip && (
                      <Star className="w-4 h-4 fill-accent text-accent" />
                    )}
                  </div>
                  {client.nationality && (
                    <p className="text-xs text-muted-foreground">{client.nationality}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="mb-4 p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{client.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-border">
              <Button variant="outline" size="sm">
                Voir profil
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="gravity-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Aucun client trouvé</h3>
          <p className="text-sm text-muted-foreground">
            {clients.length === 0 
              ? "Ajoutez votre premier client" 
              : "Essayez de modifier votre recherche"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Clients;
