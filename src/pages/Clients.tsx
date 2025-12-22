import { useState } from 'react';
import { Plus, Search, Star, Mail, Phone, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { guests, formatCurrency, formatDate } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVipOnly, setShowVipOnly] = useState(false);

  const vipCount = guests.filter(g => g.isVip).length;

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = 
      guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVip = !showVipOnly || guest.isVip;
    
    return matchesSearch && matchesVip;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Fichier clients"
        subtitle={`${guests.length} clients • ${vipCount} VIP`}
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        }
      />

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
        {filteredGuests.map((guest) => (
          <div key={guest.id} className="client-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-hotel-orange-light flex items-center justify-center text-sm font-semibold text-accent">
                  {guest.firstName[0]}{guest.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {guest.firstName} {guest.lastName}
                    </h3>
                    {guest.isVip && (
                      <Star className="w-4 h-4 fill-accent text-accent" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">CLI{guest.id.slice(-3).toUpperCase()}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{guest.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{guest.phone}</span>
              </div>
              {guest.lastVisit && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Dernière visite: {formatDate(guest.lastVisit)}</span>
                </div>
              )}
            </div>

            {/* Preferences */}
            {guest.preferences && (
              <div className="mb-4 p-2 bg-hotel-blue-light rounded-lg">
                <p className="text-xs text-info">🏨 {guest.preferences}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{guest.totalStays}</p>
                <p className="text-xs text-muted-foreground">Séjours</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(guest.totalSpent)}
                </p>
                <p className="text-xs text-muted-foreground">Total dépensé</p>
              </div>
              <Button variant="outline" size="sm">
                Voir profil
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="gravity-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Aucun client trouvé</h3>
          <p className="text-sm text-muted-foreground">
            Essayez de modifier votre recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default Clients;
