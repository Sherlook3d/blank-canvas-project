import { useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, LogIn, LogOut, MoreVertical, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel } from '@/contexts/HotelContext';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { RoomSelectionModal } from '@/components/reservations/RoomSelectionModal';
import { ReservationsCalendar } from '@/components/reservations/ReservationsCalendar';
import { formatCurrency, formatDate } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Reservation, ReservationStatus } from '@/types/hotel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterStatus = 'all' | ReservationStatus;
type ViewMode = 'list' | 'calendar';

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'pending', label: 'En attente' },
  { value: 'checked_in', label: 'En cours' },
  { value: 'checked_out', label: 'Terminées' },
];

const Reservations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showForm, setShowForm] = useState(false);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const { reservations, checkIn, checkOut } = useHotel();

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guest?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.guest?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.roomType?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || res.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const canCheckIn = (status: ReservationStatus) => 
    status === 'confirmed' || status === 'pending';
  
  const canCheckOut = (status: ReservationStatus) => 
    status === 'checked_in';

  const handleCheckInClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowRoomSelection(true);
  };

  const handleCheckInConfirm = (reservationId: string, roomId: string) => {
    checkIn(reservationId, roomId);
  };

  const handleCheckOut = (reservationId: string) => {
    checkOut(reservationId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Réservations"
        subtitle="Gérez toutes les réservations de votre hôtel"
        actions={
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === 'calendar' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Vue calendrier"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>

            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4" />
              Nouvelle réservation
            </Button>
          </div>
        }
      />

      <ReservationForm open={showForm} onOpenChange={setShowForm} />
      <RoomSelectionModal 
        open={showRoomSelection} 
        onOpenChange={setShowRoomSelection}
        reservation={selectedReservation}
        onConfirm={handleCheckInConfirm}
      />

      {viewMode === 'calendar' ? (
        <ReservationsCalendar onViewChange={setViewMode} />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="gravity-card">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, chambre ou n° de réservation..."
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

          {/* Reservations Table */}
          <div className="gravity-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="gravity-table">
                <thead className="bg-muted/30">
                  <tr>
                    <th>Réservation</th>
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
                        <div>
                          <p className="font-medium text-foreground">{reservation.code}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(reservation.createdAt)}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                            {reservation.guest?.firstName?.[0]}{reservation.guest?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {reservation.guest?.firstName} {reservation.guest?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{reservation.guest?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-foreground">
                            {reservation.roomType?.name} {reservation.room?.number || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">{reservation.roomType?.name}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{reservation.nights} nuits</p>
                      </td>
                      <td className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(reservation.totalAmount, reservation.currency)}
                        </p>
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
                              onClick={() => handleCheckInClick(reservation)}
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
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Voir détails</DropdownMenuItem>
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Annuler</DropdownMenuItem>
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
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reservations;