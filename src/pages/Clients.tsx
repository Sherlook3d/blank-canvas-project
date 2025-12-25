import { useState, useMemo } from 'react';
import { Plus, Search, Star, Phone, UserPlus, LayoutGrid, List, Eye, History, Clock, DollarSign, CalendarPlus, TrendingUp, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { DebtBadge } from '@/components/ui/DebtBadge';
import { useHotel, Client } from '@/contexts/HotelContext';
import { useCurrency } from '@/contexts/CurrencyContext';
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
import { ClientDetailsDialog } from '@/components/clients/ClientDetailsDialog';
import { ClientHistoryDialog } from '@/components/clients/ClientHistoryDialog';
import { getClientStats } from '@/hooks/useClientStats';

type ViewMode = 'grid' | 'list';

const Clients = () => {
  const { formatCurrency, currency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showClientHistory, setShowClientHistory] = useState(false);
  const [minDays, setMinDays] = useState<number | null>(null);
  const [minSpent, setMinSpent] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vip: false,
  });
  const { clients, reservations, isLoading, addClient, refreshData } = useHotel();

  const vipCount = clients.filter(c => c.vip).length;

  // Pre-compute stats for all clients
  const clientsWithStats = useMemo(() => {
    return clients.map(client => ({
      ...client,
      stats: getClientStats(client.id, reservations)
    }));
  }, [clients, reservations]);

  const filteredClients = useMemo(() => {
    return clientsWithStats
      .filter((client) => {
        const matchesSearch = 
          client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (client.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesVip = !showVipOnly || client.vip;
        const matchesMinDays = minDays === null || client.stats.totalDays >= minDays;
        const matchesMinSpent = minSpent === null || client.stats.totalSpent >= minSpent;
        
        return matchesSearch && matchesVip && matchesMinDays && matchesMinSpent;
      })
      .sort((a, b) => {
        // Sort by total spent descending when filter is active
        if (minSpent !== null) return b.stats.totalSpent - a.stats.totalSpent;
        // Sort by days descending when filter is active
        if (minDays !== null) return b.stats.totalDays - a.stats.totalDays;
        return 0;
      });
  }, [clientsWithStats, searchQuery, showVipOnly, minDays, minSpent]);

  const hasActiveFilters = minDays !== null || minSpent !== null;

  const clearFilters = () => {
    setMinDays(null);
    setMinSpent(null);
  };

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

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client);
    setShowClientHistory(true);
  };

  const handleClientDetailsClose = (open: boolean) => {
    setShowClientDetails(open);
    if (!open) {
      refreshData();
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

      {/* Client Details Dialog */}
      <ClientDetailsDialog
        client={selectedClient}
        open={showClientDetails}
        onOpenChange={handleClientDetailsClose}
      />

      {/* Client History Dialog */}
      <ClientHistoryDialog
        client={selectedClient}
        open={showClientHistory}
        onOpenChange={setShowClientHistory}
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
      <div className="gravity-card space-y-4">
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
          
          <div className="flex items-center gap-3">
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'filter-pill flex items-center gap-2',
                (showFilters || hasActiveFilters) && 'filter-pill-active'
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Meilleurs clients
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </button>

            <div className="flex border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-border animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Filter className="w-4 h-4" />
                Filtres avancés
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs gap-1">
                  <X className="w-3 h-3" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDays" className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Minimum de jours passés
                </Label>
                <div className="flex gap-2">
                  {[5, 10, 30].map((days) => (
                    <button
                      key={days}
                      onClick={() => setMinDays(minDays === days ? null : days)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        minDays === days 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {days}+ jours
                    </button>
                  ))}
                  <Input
                    type="number"
                    placeholder="Autre..."
                    className="w-24 h-8 text-sm"
                    value={minDays && ![5, 10, 30].includes(minDays) ? minDays : ''}
                    onChange={(e) => setMinDays(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minSpent" className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-accent" />
                  Minimum dépensé (XOF)
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {[100000, 500000, 1000000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setMinSpent(minSpent === amount ? null : amount)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        minSpent === amount 
                          ? 'bg-accent text-accent-foreground border-accent' 
                          : 'border-border hover:bg-muted'
                      )}
                    >
                      {amount >= 1000000 ? `${amount / 1000000}M+` : `${amount / 1000}k+`}
                    </button>
                  ))}
                  <Input
                    type="number"
                    placeholder="Autre..."
                    className="w-28 h-8 text-sm"
                    value={minSpent && ![100000, 500000, 1000000].includes(minSpent) ? minSpent : ''}
                    onChange={(e) => setMinSpent(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
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
                      <DebtBadge amount={client.argent_du || 0} />
                    </div>
                    {(client as any).company && (
                      <p className="text-xs text-muted-foreground">{(client as any).company}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{client.stats.totalDays}</p>
                    <p className="text-xs text-muted-foreground">jours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(client.stats.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">dépensé</p>
                  </div>
                </div>
              </div>

              {/* Contact Info - Clickable phone */}
              <div className="space-y-2 mb-4">
                {client.phone && (
                  <a 
                    href={`tel:${client.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="underline">{client.phone}</span>
                  </a>
                )}
              </div>

              {/* Notes */}
              {client.notes && (
                <div className="mb-4 p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground line-clamp-2">{client.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewHistory(client)}
                  className="gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  Historique
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewProfile(client)}>
                  Voir profil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="gravity-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gravity-table">
              <thead className="bg-muted/30">
                <tr>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>Jours passés</th>
                  <th>Total dépensé</th>
                  <th>VIP</th>
                  <th className="w-48">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-hotel-orange-light flex items-center justify-center text-sm font-semibold text-accent">
                          {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {client.first_name} {client.last_name}
                            </p>
                            <DebtBadge amount={client.argent_du || 0} />
                          </div>
                          {client.notes && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{client.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {client.phone ? (
                        <a 
                          href={`tel:${client.phone.replace(/\s/g, '')}`}
                          className="text-primary hover:text-primary/80 underline transition-colors"
                        >
                          {client.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium">{client.stats.totalDays}</span>
                        <span className="text-muted-foreground text-xs">jours</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium text-accent">{formatCurrency(client.stats.totalSpent)}</span>
                    </td>
                    <td>
                      {client.vip ? (
                        <Star className="w-4 h-4 fill-accent text-accent" />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleViewHistory(client)}
                        >
                          <History className="w-3.5 h-3.5" />
                          Historique
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleViewProfile(client)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
