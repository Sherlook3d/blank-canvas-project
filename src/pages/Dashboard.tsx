import { 
  BedDouble, 
  CalendarCheck, 
  Euro, 
  Users,
  Calendar,
  FileText,
  Wifi,
  Wind,
  Wine,
  Bath
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel, RoomType } from '@/contexts/HotelContext';
import { cn } from '@/lib/utils';

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
};

const amenityIcons: Record<string, React.ElementType> = {
  'Wi-Fi': Wifi,
  'Climatisation': Wind,
  'Minibar': Wine,
  'Baignoire': Bath,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const Dashboard = () => {
  const { hotel, rooms, clients, reservations, isLoading } = useHotel();

  // Calculate stats
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayReservations = reservations.filter(r => 
    r.check_in === today || r.check_out === today
  ).length;
  
  const arrivals = reservations.filter(r => r.check_in === today && r.status !== 'cancelled').length;
  const departures = reservations.filter(r => r.check_out === today && r.status === 'checked_in').length;
  
  const monthlyRevenue = reservations
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  const vipClients = clients.filter(c => c.vip).length;

  const recentReservations = reservations
    .filter(r => r.status !== 'cancelled')
    .slice(0, 4);

  const featuredRooms = rooms.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader 
        title="Tableau de bord"
        subtitle={hotel ? `Bienvenue, voici un aperçu de ${hotel.name}` : "Bienvenue sur HotelManager"}
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <FileText className="w-4 h-4" />
            Rapport
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KpiCard
          icon={BedDouble}
          iconColor="green"
          title="Chambres disponibles"
          value={availableRooms}
          subtitle={`sur ${rooms.length} chambres`}
          change={occupancyRate > 50 ? 8 : -5}
        />
        <KpiCard
          icon={CalendarCheck}
          iconColor="orange"
          title="Réservations du jour"
          value={todayReservations}
          subtitle={`${arrivals} arrivées, ${departures} départs`}
          change={12}
        />
        <KpiCard
          icon={Euro}
          iconColor="yellow"
          title="Revenus du mois"
          value={formatCurrency(monthlyRevenue)}
          subtitle="Ce mois"
          change={15}
        />
        <KpiCard
          icon={Users}
          iconColor="orange"
          title="Clients VIP"
          value={vipClients}
          subtitle={`sur ${clients.length} clients`}
          change={5}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Stats */}
        <div className="gravity-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Taux d'occupation</h3>
              <p className="text-sm text-muted-foreground">Aujourd'hui</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{occupancyRate}%</p>
              <p className="text-xs text-success">+{Math.abs(occupancyRate - 50)}% vs moyenne</p>
            </div>
          </div>
          
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{availableRooms}</p>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{occupiedRooms}</p>
              <p className="text-xs text-muted-foreground">Occupées</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">
                {rooms.filter(r => r.status === 'maintenance').length}
              </p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="gravity-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Réservations récentes</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Voir tout
            </Button>
          </div>
          
          {recentReservations.length > 0 ? (
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {reservation.client?.first_name?.[0]}{reservation.client?.last_name?.[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {reservation.client?.first_name} {reservation.client?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {reservation.room?.type ? roomTypeLabels[reservation.room.type] : ''} {reservation.room?.number}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(reservation.check_in)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(reservation.check_out)}</span>
                    </div>
                  </div>
                  
                  <StatusBadge status={reservation.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">Aucune réservation récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Rooms */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-foreground">Chambres</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Voir toutes les chambres
          </Button>
        </div>
        
        {featuredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {featuredRooms.map((room) => (
              <div key={room.id} className="room-card">
                {/* Room Image Placeholder */}
                <div className="relative h-32 bg-muted flex items-center justify-center">
                  <BedDouble className="w-12 h-12 text-muted-foreground/50" />
                  <StatusBadge 
                    status={room.status} 
                    className="absolute top-3 right-3"
                  />
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-foreground/80 rounded text-xs font-medium text-background">
                    {formatCurrency(room.price_per_night)}/nuit
                  </div>
                </div>
                
                {/* Room Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{roomTypeLabels[room.type]} {room.number}</h4>
                      <p className="text-sm text-muted-foreground">{roomTypeLabels[room.type]} • Étage {room.floor}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity}</span>
                    </div>
                  </div>
                  
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 3).map((amenity) => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <div 
                          key={amenity} 
                          className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className={cn(
                        "flex-1",
                        room.status === 'available' 
                          ? "bg-primary hover:bg-primary/90" 
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                      disabled={room.status !== 'available'}
                    >
                      Réserver
                    </Button>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gravity-card flex flex-col items-center justify-center py-12 text-center">
            <BedDouble className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">Aucune chambre</h3>
            <p className="text-sm text-muted-foreground">
              Allez dans "Chambres" pour ajouter votre première chambre
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
