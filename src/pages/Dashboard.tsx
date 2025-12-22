import { 
  BedDouble, 
  CalendarCheck, 
  Euro, 
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Wifi,
  Wind,
  Wine,
  Bath
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  dashboardStats, 
  weeklyOccupancy, 
  reservations, 
  rooms, 
  roomTypes,
  formatCurrency,
  formatShortDate 
} from '@/data/mockData';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';

const amenityIcons: Record<string, React.ElementType> = {
  'Wi-Fi': Wifi,
  'Climatisation': Wind,
  'Minibar': Wine,
  'Baignoire': Bath,
};

const Dashboard = () => {
  const recentReservations = reservations
    .filter(r => r.status !== 'cancelled')
    .slice(0, 4);

  const featuredRooms = rooms.slice(0, 4).map(room => ({
    ...room,
    roomType: roomTypes.find(rt => rt.id === room.roomTypeId),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader 
        title="Tableau de bord"
        subtitle="Bienvenue, voici un aperçu de votre hôtel"
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
          value={dashboardStats.availableRooms}
          subtitle={`sur ${dashboardStats.totalRooms} chambres`}
          change={8}
        />
        <KpiCard
          icon={CalendarCheck}
          iconColor="orange"
          title="Réservations du jour"
          value={dashboardStats.todayReservations}
          subtitle={`${dashboardStats.arrivals} arrivées, ${dashboardStats.departures} départs`}
          change={12}
        />
        <KpiCard
          icon={Euro}
          iconColor="yellow"
          title="Revenus du mois"
          value={formatCurrency(dashboardStats.monthlyRevenue)}
          subtitle="Décembre 2025"
          change={15}
        />
        <KpiCard
          icon={Users}
          iconColor="orange"
          title="Clients fidèles"
          value={dashboardStats.loyalClients}
          subtitle={`${dashboardStats.newClientsThisMonth} nouveaux ce mois`}
          change={5}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="gravity-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Taux d'occupation</h3>
              <p className="text-sm text-muted-foreground">Cette semaine</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{dashboardStats.occupancyRate}%</p>
              <p className="text-xs text-success">+{dashboardStats.occupancyChange}% vs semaine dernière</p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyOccupancy}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(213, 56%, 24%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(213, 56%, 24%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(215, 16%, 47%)' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(0, 0%, 100%)', 
                    border: '1px solid hsl(214, 32%, 91%)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px hsl(0 0% 0% / 0.07)'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Occupation']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(213, 56%, 24%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#occupancyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
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
          
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div 
                key={reservation.id} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {reservation.guest?.firstName?.[0]}{reservation.guest?.lastName?.[0]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {reservation.guest?.firstName} {reservation.guest?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {reservation.roomType?.name} {reservation.room?.number}
                  </p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatShortDate(reservation.checkIn)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatShortDate(reservation.checkOut)}</span>
                  </div>
                </div>
                
                <StatusBadge status={reservation.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Rooms */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-foreground">Chambres en vedette</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Voir toutes les chambres
          </Button>
        </div>
        
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
                  {formatCurrency(room.roomType?.basePrice || 0)}/nuit
                </div>
              </div>
              
              {/* Room Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{room.roomType?.name} {room.number}</h4>
                    <p className="text-sm text-muted-foreground">{room.roomType?.name} • Étage {room.floor}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{room.roomType?.capacityAdults}</span>
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.roomType?.amenities.slice(0, 3).map((amenity) => {
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
      </div>
    </div>
  );
};

export default Dashboard;
