import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Activity,
  Database,
  Loader2,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { useComptes } from '@/hooks/useComptes';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DebtBadge } from '@/components/ui/DebtBadge';
import { BalanceBadge } from '@/components/ui/BalanceBadge';
import { useHotel, RoomType, Room } from '@/contexts/HotelContext';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RoomDetailsDialog } from '@/components/rooms/RoomDetailsDialog';
import { NewReservationDialog } from '@/components/reservations/NewReservationDialog';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
  bungalow: 'Bungalow',
};

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  'Wi-Fi': Wifi,
  'TV Canal+': Wine,
  TV: Wine,
  Climatisation: Wind,
  Climatiseur: Wind,
  'Eau chaude': Bath,
  Minibar: Wine,
  Baignoire: Bath,
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { hotel, rooms, clients, reservations, isLoading, refreshData } = useHotel();
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();
  const { getStats: getComptesStats, comptesOuverts } = useComptes();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAddingDemoData, setIsAddingDemoData] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [preSelectedRoomId, setPreSelectedRoomId] = useState<string | undefined>();
  
  const comptesStats = getComptesStats();

  const hasNoData = rooms.length === 0 && clients.length === 0 && reservations.length === 0;

  const addDemoData = async () => {
    if (!hotel?.id) return;
    
    setIsAddingDemoData(true);
    try {
      // Create demo rooms
      const roomsData = [
        { hotel_id: hotel.id, number: '101', type: 'single', capacity: 1, price_per_night: 65, floor: 1, status: 'available', amenities: ['WiFi', 'TV', 'Climatisation'] },
        { hotel_id: hotel.id, number: '102', type: 'single', capacity: 1, price_per_night: 65, floor: 1, status: 'available', amenities: ['WiFi', 'TV', 'Climatisation'] },
        { hotel_id: hotel.id, number: '103', type: 'double', capacity: 2, price_per_night: 95, floor: 1, status: 'maintenance', amenities: ['WiFi', 'TV', 'Climatisation'] },
        { hotel_id: hotel.id, number: '201', type: 'double', capacity: 2, price_per_night: 95, floor: 2, status: 'available', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'] },
        { hotel_id: hotel.id, number: '202', type: 'family', capacity: 4, price_per_night: 150, floor: 2, status: 'occupied', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar'] },
        { hotel_id: hotel.id, number: '301', type: 'suite', capacity: 2, price_per_night: 200, floor: 3, status: 'available', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Jacuzzi', 'Vue mer'] },
        { hotel_id: hotel.id, number: '302', type: 'suite', capacity: 2, price_per_night: 250, floor: 3, status: 'available', amenities: ['WiFi', 'TV', 'Climatisation', 'Minibar', 'Jacuzzi', 'Vue mer', 'Balcon'] },
      ];

      const { data: createdRooms, error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsData)
        .select();

      if (roomsError) throw roomsError;

      // Create demo clients
      const clientsData = [
        { hotel_id: hotel.id, first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78', nationality: 'France', id_type: 'CNI', id_number: 'FR123456', vip: false },
        { hotel_id: hotel.id, first_name: 'Marie', last_name: 'Martin', email: 'marie.martin@email.com', phone: '+33 6 98 76 54 32', nationality: 'France', id_type: 'Passeport', id_number: 'FR789012', vip: true },
        { hotel_id: hotel.id, first_name: 'Pierre', last_name: 'Bernard', email: 'pierre.bernard@email.com', phone: '+33 6 55 44 33 22', nationality: 'Belgique', id_type: 'CNI', id_number: 'BE456789', company: 'TechCorp', vip: false },
        { hotel_id: hotel.id, first_name: 'Sophie', last_name: 'Petit', email: 'sophie.petit@email.com', phone: '+33 6 11 22 33 44', nationality: 'Suisse', id_type: 'Passeport', id_number: 'CH112233', vip: true },
        { hotel_id: hotel.id, first_name: 'Lucas', last_name: 'Moreau', email: 'lucas.moreau@email.com', phone: '+33 6 77 88 99 00', nationality: 'France', id_type: 'CNI', id_number: 'FR334455', vip: false },
      ];

      const { data: createdClients, error: clientsError } = await supabase
        .from('clients')
        .insert(clientsData)
        .select();

      if (clientsError) throw clientsError;

      // Create demo reservations
      const today = new Date();
      const reservationsData = [
        {
          hotel_id: hotel.id,
          room_id: createdRooms![4].id,
          client_id: createdClients![0].id,
          check_in: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          check_out: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'checked_in',
          payment_status: 'paid',
          total_price: 600,
          notes: 'Client régulier, chambre calme demandée',
        },
        {
          hotel_id: hotel.id,
          room_id: createdRooms![0].id,
          client_id: createdClients![1].id,
          check_in: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          check_out: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'confirmed',
          payment_status: 'partial',
          total_price: 255,
          notes: 'Cliente VIP - Prévoir bouquet de fleurs',
        },
        {
          hotel_id: hotel.id,
          room_id: createdRooms![5].id,
          client_id: createdClients![2].id,
          check_in: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          check_out: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          payment_status: 'pending',
          total_price: 600,
          notes: 'Voyage d\'affaires - Facture entreprise TechCorp',
        },
        {
          hotel_id: hotel.id,
          room_id: createdRooms![3].id,
          client_id: createdClients![3].id,
          check_in: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          check_out: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'confirmed',
          payment_status: 'paid',
          total_price: 480,
        },
      ];

      const { error: reservationsError } = await supabase
        .from('reservations')
        .insert(reservationsData);

      if (reservationsError) throw reservationsError;

      toast({
        title: 'Données de démonstration ajoutées',
        description: `${createdRooms!.length} chambres, ${createdClients!.length} clients et ${reservationsData.length} réservations créés.`,
      });

      refreshData();
    } catch (error: any) {
      console.error('Demo data error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'ajout des données',
        variant: 'destructive',
      });
    } finally {
      setIsAddingDemoData(false);
    }
  };

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

    // Revenue last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const revenueLast7Days = last7Days.map(date => {
      const dayRevenue = reservations
        .filter(r => r.status !== 'cancelled' && r.check_in === date)
        .reduce((sum, r) => sum + (r.total_price || 0), 0);
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      };
    });

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
      revenueLast7Days,
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

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleReserveRoom = (room: Room) => {
    if (room.status === 'available') {
      setPreSelectedRoomId(room.id);
      setShowNewReservation(true);
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
    <div className="space-y-8 animate-fade-in">
      {/* Empty State - Add Demo Data */}
      {hasNoData && (
        <div className="gravity-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucune donnée</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Votre hôtel est prêt mais il n'y a pas encore de données. Ajoutez des données de démonstration pour explorer l'application.
          </p>
          <Button 
            onClick={addDemoData} 
            disabled={isAddingDemoData}
            className="gap-2"
          >
            {isAddingDemoData ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Ajouter des données de démonstration
              </>
            )}
          </Button>
        </div>
      )}
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
            <Button variant="gradient" className="gap-2">
              <FileText className="w-4 h-4" />
              Rapport
            </Button>
          </div>
        }
      />

      {/* Compact Stats Grid - All key metrics in one compact row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
        {/* Chambres disponibles */}
        <div className="gravity-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <BedDouble className="w-5 h-5 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{stats.availableRooms}</p>
              <p className="text-xs text-muted-foreground truncate">Disponibles</p>
            </div>
          </div>
        </div>

        {/* Taux occupation */}
        <div className="gravity-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{stats.occupancyRate}%</p>
              <p className="text-xs text-muted-foreground truncate">Occupation</p>
            </div>
          </div>
        </div>

        {/* Arrivées du jour */}
        <div className="gravity-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-5 h-5 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{stats.arrivals}</p>
              <p className="text-xs text-muted-foreground truncate">Arrivées</p>
            </div>
          </div>
        </div>

        {/* Départs du jour */}
        <div className="gravity-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <ArrowDownRight className="w-5 h-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{stats.departures}</p>
              <p className="text-xs text-muted-foreground truncate">Départs</p>
            </div>
          </div>
        </div>

        {/* Revenus du mois */}
        <div className="gravity-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Banknote className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-xs text-muted-foreground truncate">Revenus</p>
            </div>
          </div>
        </div>

        {/* Comptes ouverts */}
        <div className="gravity-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{comptesStats.nbComptesOuverts}</p>
              <p className="text-xs text-muted-foreground truncate">Comptes ouverts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row: Statut + Revenus + Réservations récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Occupancy Stats - Left */}
        <div className="lg:col-span-3 gravity-card p-4 h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">Statut des chambres</h3>
            <p className="text-lg font-bold text-foreground">{stats.occupancyRate}%</p>
          </div>
          
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-success/10 rounded-lg">
              <p className="text-base font-bold text-success">{stats.availableRooms}</p>
              <p className="text-[10px] text-muted-foreground">Dispo</p>
            </div>
            <div className="text-center p-2 bg-accent/10 rounded-lg">
              <p className="text-base font-bold text-accent">{stats.occupiedRooms}</p>
              <p className="text-[10px] text-muted-foreground">Occupé</p>
            </div>
            <div className="text-center p-2 bg-warning/10 rounded-lg">
              <p className="text-base font-bold text-warning">{stats.maintenanceRooms}</p>
              <p className="text-[10px] text-muted-foreground">Maint.</p>
            </div>
            <div className="text-center p-2 bg-info/10 rounded-lg">
              <p className="text-base font-bold text-info">{stats.cleaningRooms}</p>
              <p className="text-[10px] text-muted-foreground">Nett.</p>
            </div>
          </div>
        </div>

        {/* Revenue Last 7 Days Chart - Middle */}
        <div className="lg:col-span-5 gravity-card p-4 h-full">
          <h3 className="font-semibold text-sm text-foreground mb-3">Revenus des 7 derniers jours</h3>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueLast7Days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(payload[0].value as number)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reservations - Right */}
        <div className="lg:col-span-4 gravity-card p-4 h-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Réservations récentes</h3>
              <p className="text-xs text-muted-foreground">{reservations.length} total</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              onClick={() => navigate('/reservations')}
            >
              Voir tout
            </Button>
          </div>
          
          {recentReservations.length > 0 ? (
            <div className="space-y-1.5">
              {recentReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0">
                    {reservation.client?.first_name?.[0]}{reservation.client?.last_name?.[0]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {reservation.client?.first_name} {reservation.client?.last_name}
                      </p>
                      <DebtBadge amount={reservation.client?.argent_du || 0} />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                      {reservation.room?.type ? roomTypeLabels[reservation.room.type] : ''} {reservation.room?.number}
                      {reservation.acompte && reservation.acompte > 0 && reservation.acompte < reservation.total_price && (
                        <BalanceBadge 
                          totalPrice={reservation.total_price} 
                          acompte={reservation.acompte}
                          size="sm"
                        />
                      )}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-medium text-foreground">
                      {formatCurrency(reservation.total_price)}
                    </p>
                    <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                      <Calendar className="w-2 h-2" />
                      <span>{formatDate(reservation.check_in)}</span>
                    </div>
                  </div>
                  
                  <StatusBadge status={reservation.status} className="text-[9px] px-1.5 py-0.5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CalendarCheck className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">Aucune réservation récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Rooms */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-foreground">Chambres</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/chambres')}
          >
            Voir toutes les chambres
          </Button>
        </div>
        
        {featuredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {featuredRooms.map((room) => (
              <div 
                key={room.id} 
                className="room-card cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => handleRoomClick(room)}
              >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReserveRoom(room);
                      }}
                    >
                      Réserver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomClick(room);
                      }}
                    >
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

      {/* Room Details Dialog */}
      <RoomDetailsDialog
        room={selectedRoom}
        open={showRoomDetails}
        onOpenChange={setShowRoomDetails}
      />

      {/* New Reservation Dialog */}
      <NewReservationDialog
        open={showNewReservation}
        onOpenChange={setShowNewReservation}
        preSelectedRoomId={preSelectedRoomId}
      />
    </div>
  );
};

export default Dashboard;