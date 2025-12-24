import { useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, LogIn, LogOut, MoreVertical, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel, ReservationStatus, RoomType, Reservation } from '@/contexts/HotelContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NewReservationDialog } from '@/components/reservations/NewReservationDialog';
import { ReservationsCalendar } from '@/components/reservations/ReservationsCalendar';
import { ReservationDetailsDialog } from '@/components/reservations/ReservationDetailsDialog';

type FilterStatus = 'all' | ReservationStatus;
type ViewMode = 'list' | 'calendar';

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'pending', label: 'En attente' },
  { value: 'checked_in', label: 'En cours' },
  { value: 'checked_out', label: 'Terminées' },
];

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const Reservations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const { reservations, checkIn: doCheckIn, checkOut: doCheckOut, isLoading, refreshData, updateReservation } = useHotel();
  const { formatCurrency } = useCurrency();

  const filteredReservations = reservations.filter((res) => {
    const clientName = `${res.client?.first_name || ''} ${res.client?.last_name || ''}`.toLowerCase();
    const roomNumber = res.room?.number || '';
    
    const matchesSearch = 
      clientName.includes(searchQuery.toLowerCase()) ||
      roomNumber.includes(searchQuery);
    
    const matchesFilter = activeFilter === 'all' || res.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const canCheckIn = (status: ReservationStatus) => 
    status === 'confirmed' || status === 'pending';
  
  const canCheckOut = (status: ReservationStatus) => 
    status === 'checked_in';

  const handleCheckIn = async (reservationId: string) => {
    await doCheckIn(reservationId);
  };

  const handleCheckOut = async (reservationId: string) => {
    await doCheckOut(reservationId);
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowReservationDetails(true);
  };

  const handleReservationDetailsClose = (open: boolean) => {
    setShowReservationDetails(open);
    if (!open) {
      refreshData();
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    await updateReservation(reservationId, { status: 'cancelled' });
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
      <NewReservationDialog 
        open={isNewReservationOpen} 
        onOpenChange={setIsNewReservationOpen} 
      />

      <ReservationDetailsDialog
        reservation={selectedReservation}
        open={showReservationDetails}
        onOpenChange={handleReservationDetailsClose}
      />

      <PageHeader 
        title="Réservations"
        subtitle="Gérez toutes les réservations de votre hôtel"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1.5"
              >
                <List className="w-4 h-4" />
                Liste
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="gap-1.5"
              >
                <CalendarIcon className="w-4 h-4" />
                Calendrier
              </Button>
            </div>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={() => setIsNewReservationOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Nouvelle réservation
            </Button>
          </div>
        }
      />

      {/* Search and Filters - Only show in list view */}
      {viewMode === 'list' && (
        <div className="gravity-card">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou chambre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    'filter-pill',
                    activeFilter === filter.value && 'filter-pill-active'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <ReservationsCalendar reservations={reservations} />
      )}

      {/* List View - Reservations Table */}
      {viewMode === 'list' && (
        <div className="gravity-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gravity-table">
              <thead className="bg-muted/30">
                <tr>
                  <th>Client</th>
                  <th>Chambre</th>
                  <th>Dates</th>
                  <th className="text-right">Total</th>
                  <th>Statut</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {reservation.client?.first_name?.[0]}{reservation.client?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {reservation.client?.first_name} {reservation.client?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{reservation.client?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-foreground">
                          {reservation.room?.type ? roomTypeLabels[reservation.room.type] : ''} {reservation.room?.number || ''}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(reservation.check_in)} - {formatDate(reservation.check_out)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {calculateNights(reservation.check_in, reservation.check_out)} nuits
                      </p>
                    </td>
                    <td className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(reservation.total_price)}
                      </p>
                      <StatusBadge status={reservation.payment_status} className="text-xs" />
                    </td>
                    <td>
                      <StatusBadge status={reservation.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {canCheckIn(reservation.status) && (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1.5 bg-primary hover:bg-primary/90"
                            onClick={() => handleCheckIn(reservation.id)}
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            Check-in
                          </Button>
                        )}
                        {canCheckOut(reservation.status) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5"
                            onClick={() => handleCheckOut(reservation.id)}
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Check-out
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleViewDetails(reservation)}>
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(reservation)}>
                              Modifier
                            </DropdownMenuItem>
                            {reservation.status !== 'cancelled' && reservation.status !== 'checked_out' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleCancelReservation(reservation.id)}
                              >
                                Annuler
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReservations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground mb-1">Aucune réservation trouvée</h3>
              <p className="text-sm text-muted-foreground">
                {reservations.length === 0 
                  ? "Créez votre première réservation" 
                  : "Essayez de modifier vos filtres ou votre recherche"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reservations;
