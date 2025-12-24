import { useEffect, useState, useMemo } from 'react';
import { 
  BedDouble, 
  CalendarCheck, 
  Banknote, 
  Users,
  Calendar,
  FileText,
  Wifi,
  Wind,
  Wine,
  Bath,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel, RoomType } from '@/contexts/HotelContext';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';

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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const Dashboard = () => {
  const { hotel, rooms, clients, reservations, isLoading, refreshData } = useHotel();
  const { formatCurrency } = useCurrency();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const roomsChannel = supabase
      .channel('dashboard-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => refreshData()
      )
      .subscribe();

    const reservationsChannel = supabase
      .channel('dashboard-reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => refreshData()
      )
      .subscribe();

    const clientsChannel = supabase
      .channel('dashboard-clients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => refreshData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(reservationsChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, [refreshData]);

  // Calculate stats
  const stats = useMemo(() => {
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
    const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
    
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservations.filter(r => 
      r.check_in === today || r.check_out === today
    ).length;
    
    const arrivals = reservations.filter(r => r.check_in === today && r.status !== 'cancelled').length;
    const departures = reservations.filter(r => r.check_out === today && r.status === 'checked_in').length;
    const pendingCheckIns = reservations.filter(r => r.check_in === today && (r.status === 'confirmed' || r.status === 'pending')).length;
    
    // Current month revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = reservations
      .filter(r => {
        const checkInDate = new Date(r.check_in);
        return r.status !== 'cancelled' && 
               checkInDate.getMonth() === currentMonth && 
               checkInDate.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + (r.total_price || 0), 0);

    // Calculate revenue by room type
    const revenueByRoomType = reservations
      .filter(r => r.status !== 'cancelled')
      .reduce((acc, r) => {
        const roomType = r.room?.type || 'unknown';
        acc[roomType] = (acc[roomType] || 0) + (r.total_price || 0);
        return acc;
      }, {} as Record<string, number>);

    const vipClients = clients.filter(c => c.vip).length;
    const activeReservations = reservations.filter(r => r.status === 'checked_in').length;

    // Average daily rate
    const totalRoomRevenue = reservations
      .filter(r => r.status !== 'cancelled' && r.total_price > 0)
      .reduce((sum, r) => sum + r.total_price, 0);
    const totalRoomNights = reservations
      .filter(r => r.status !== 'cancelled' && r.total_price > 0)
      .length;
    const averageDailyRate = totalRoomNights > 0 ? totalRoomRevenue / totalRoomNights : 0;

    return {
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      cleaningRooms,
      occupancyRate,
      todayReservations,
      arrivals,
      departures,
      pendingCheckIns,
      monthlyRevenue,
      revenueByRoomType,
      vipClients,
      activeReservations,
      averageDailyRate,
      totalClients: clients.length,
    };
  }, [rooms, clients, reservations]);

  const recentReservations = reservations
    .filter(r => r.status !== 'cancelled')
    .slice(0, 5);

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-2 rounded-lg border">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-2 rounded-lg">
              <Activity className="w-4 h-4" />
              <span>En direct</span>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <FileText className="w-4 h-4" />
              Rapport
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KpiCard
          icon={BedDouble}
          iconColor="green"
          title="Chambres disponibles"
          value={stats.availableRooms}
          subtitle={`sur ${rooms.length} chambres`}
          change={stats.occupancyRate > 50 ? 8 : -5}
        />
        <KpiCard
          icon={CalendarCheck}
          iconColor="orange"
          title="Réservations du jour"
          value={stats.todayReservations}
          subtitle={`${stats.arrivals} arrivées, ${stats.departures} départs`}
          change={12}
        />
        <KpiCard
          icon={Banknote}
          iconColor="yellow"
          title="Revenus du mois"
          value={formatCurrency(stats.monthlyRevenue)}
          subtitle="Ce mois"
          change={15}
        />
        <KpiCard
          icon={Users}
          iconColor="orange"
          title="Clients VIP"
          value={stats.vipClients}
          subtitle={`sur ${stats.totalClients} clients`}
          change={5}
        />
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gravity-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.occupancyRate}%</p>
            <p className="text-xs text-muted-foreground">Taux d'occupation</p>
          </div>
        </div>
        
        <div className="gravity-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.pendingCheckIns}</p>
            <p className="text-xs text-muted-foreground">Check-ins en attente</p>
          </div>
        </div>
        
        <div className="gravity-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
            <BedDouble className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.activeReservations}</p>
            <p className="text-xs text-muted-foreground">Séjours en cours</p>
          </div>
        </div>
        
        <div className="gravity-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.averageDailyRate)}</p>
            <p className="text-xs text-muted-foreground">Prix moyen/nuit</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Stats */}
        <div className="gravity-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Statut des chambres</h3>
              <p className="text-sm text-muted-foreground">Temps réel</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{stats.occupancyRate}%</p>
              <p className="text-xs text-success flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3" />
                Occupation
              </p>
            </div>
          </div>
          
          <div className="h-4 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            {stats.occupiedRooms} chambres occupées sur {rooms.length}
          </p>
          
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-success/10 rounded-xl border border-success/20">
              <p className="text-xl font-bold text-success">{stats.availableRooms}</p>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </div>
            <div className="text-center p-3 bg-accent/10 rounded-xl border border-accent/20">
              <p className="text-xl font-bold text-accent">{stats.occupiedRooms}</p>
              <p className="text-xs text-muted-foreground">Occupées</p>
            </div>
            <div className="text-center p-3 bg-warning/10 rounded-xl border border-warning/20">
              <p className="text-xl font-bold text-warning">{stats.maintenanceRooms}</p>
              <p className="text-xs text-muted-foreground">Maintenance</p>
            </div>
            <div className="text-center p-3 bg-info/10 rounded-xl border border-info/20">
              <p className="text-xl font-bold text-info">{stats.cleaningRooms}</p>
              <p className="text-xs text-muted-foreground">Nettoyage</p>
            </div>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="gravity-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Réservations récentes</h3>
              <p className="text-sm text-muted-foreground">{reservations.length} total</p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Voir tout
            </Button>
          </div>
          
          {recentReservations.length > 0 ? (
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-medium text-white">
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
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(reservation.total_price)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(reservation.check_in)}</span>
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

      {/* Revenue by Room Type */}
      {Object.keys(stats.revenueByRoomType).length > 0 && (
        <div className="gravity-card">
          <h3 className="font-semibold text-foreground mb-6">Revenus par type de chambre</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.revenueByRoomType).map(([type, revenue]) => (
              <div key={type} className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">
                  {roomTypeLabels[type as RoomType] || type}
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <div className="relative h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
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