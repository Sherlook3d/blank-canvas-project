import { useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, LogIn, LogOut, MoreVertical, List, LayoutGrid, Eye, CreditCard, CirclePlus, AlertTriangle } from 'lucide-react';
import { HelpTooltip } from '@/components/help';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DebtBadge } from '@/components/ui/DebtBadge';
import { BalanceBadge } from '@/components/ui/BalanceBadge';
import { useHotel, ReservationStatus, RoomType, Reservation } from '@/contexts/HotelContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NewReservationDialog } from '@/components/reservations/NewReservationDialog';
import { ReservationsCalendar } from '@/components/reservations/ReservationsCalendar';
import { ReservationDetailsDialog } from '@/components/reservations/ReservationDetailsDialog';
import { CompteDetailsDialog } from '@/components/comptes/CompteDetailsDialog';
import { AjouterConsommationDialog } from '@/components/comptes/AjouterConsommationDialog';
import { EncaisserDialog } from '@/components/comptes/EncaisserDialog';
import { useComptes } from '@/hooks/useComptes';

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
  bungalow: 'Bungalow',
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
  
  // Compte dialogs
  const [selectedCompteId, setSelectedCompteId] = useState<string | null>(null);
  const [showCompteDetails, setShowCompteDetails] = useState(false);
  const [showAjouterConso, setShowAjouterConso] = useState(false);
  const [showEncaisser, setShowEncaisser] = useState(false);
  
  // Checkout blocked dialog
  const [showCheckoutBlocked, setShowCheckoutBlocked] = useState(false);
  const [checkoutBlockedData, setCheckoutBlockedData] = useState<{ solde: number; compteId: string; reservationId: string } | null>(null);
  
  const { reservations, checkIn: doCheckIn, checkOut: doCheckOut, isLoading, refreshData, updateReservation } = useHotel();
  const { formatCurrency } = useCurrency();
  const { comptes, encaisserPaiement, cloturerAvecDette, refreshComptes } = useComptes();

  // Get compte for reservation
  const getCompteForReservation = (reservationId: string) => {
    return comptes.find(c => c.reservation_id === reservationId);
  };

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
    const result = await doCheckIn(reservationId);
    if (result.success) {
      refreshComptes();
    }
  };

  const handleCheckOut = async (reservationId: string) => {
    const result = await doCheckOut(reservationId);
    if (!result.success && result.solde && result.compteId) {
      setCheckoutBlockedData({ 
        solde: result.solde, 
        compteId: result.compteId,
        reservationId 
      });
      setShowCheckoutBlocked(true);
    }
  };

  const handlePayAndCheckout = async () => {
    if (!checkoutBlockedData) return;
    setSelectedCompteId(checkoutBlockedData.compteId);
    setShowCheckoutBlocked(false);
    setShowEncaisser(true);
  };

  const handleCheckoutWithDebt = async () => {
    if (!checkoutBlockedData) return;
    
    const reservation = reservations.find(r => r.id === checkoutBlockedData.reservationId);
    if (reservation) {
      await cloturerAvecDette(
        checkoutBlockedData.compteId,
        reservation.client_id,
        checkoutBlockedData.solde
      );
      // Force checkout
      await updateReservation(checkoutBlockedData.reservationId, { status: 'checked_out' });
      refreshData();
      refreshComptes();
    }
    setShowCheckoutBlocked(false);
    setCheckoutBlockedData(null);
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

  // Compte actions
  const handleViewCompte = (compteId: string) => {
    setSelectedCompteId(compteId);
    setShowCompteDetails(true);
  };

  const handleAjouterConso = (compteId: string) => {
    setSelectedCompteId(compteId);
    setShowAjouterConso(true);
  };

  const handleEncaisser = (compteId: string) => {
    setSelectedCompteId(compteId);
    setShowEncaisser(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedCompte = comptes.find(c => c.id === selectedCompteId) || null;

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

      {/* Compte Dialogs */}
      <CompteDetailsDialog
        compte={selectedCompte}
        open={showCompteDetails}
        onOpenChange={setShowCompteDetails}
      />
      
      <AjouterConsommationDialog
        compte={selectedCompte}
        open={showAjouterConso}
        onOpenChange={setShowAjouterConso}
      />
      
      <EncaisserDialog
        compte={selectedCompte}
        open={showEncaisser}
        onOpenChange={(open) => {
          setShowEncaisser(open);
          if (!open && checkoutBlockedData) {
            // Retry checkout after payment
            handleCheckOut(checkoutBlockedData.reservationId);
            setCheckoutBlockedData(null);
          }
        }}
      />

      {/* Checkout Blocked Dialog */}
      <AlertDialog open={showCheckoutBlocked} onOpenChange={setShowCheckoutBlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Check-out bloqué
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Le client a un solde de <strong className="text-destructive">{formatCurrency(checkoutBlockedData?.solde || 0)}</strong> à régler.</p>
              <p>Que souhaitez-vous faire ?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button variant="outline" onClick={handleCheckoutWithDebt}>
              📋 Il payera plus tard
            </Button>
            <AlertDialogAction onClick={handlePayAndCheckout} className="bg-primary">
              💰 Il paie maintenant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <div className="flex items-center gap-1">
              <Button 
                variant="gradient"
                className="gap-2"
                onClick={() => setIsNewReservationOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Nouvelle réservation
              </Button>
              <HelpTooltip text="Créer une nouvelle réservation pour un client" side="bottom" />
            </div>
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
                  <th className="text-center">Compte</th>
                  <th>Statut</th>
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => {
                  const compte = getCompteForReservation(reservation.id);
                  
                  return (
                    <tr key={reservation.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                            {reservation.client?.first_name?.[0]}{reservation.client?.last_name?.[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {reservation.client?.first_name} {reservation.client?.last_name}
                              </p>
                              <DebtBadge amount={reservation.client?.argent_du || 0} />
                            </div>
                            <p className="text-xs text-muted-foreground">{reservation.client?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {reservation.room?.type ? roomTypeLabels[reservation.room.type] : ''} {reservation.room?.number || ''}
                          </p>
                          {compte && compte.solde > 0 && (
                            <BalanceBadge 
                              totalPrice={reservation.total_price} 
                              acompte={reservation.acompte || 0}
                              soldeCompte={compte.solde}
                              size="sm"
                            />
                          )}
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
                        {compte ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                              "text-sm font-semibold",
                              compte.solde > 0 ? "text-destructive" : "text-success"
                            )}>
                              {compte.solde > 0 ? formatCurrency(compte.solde) : '✓ Soldé'}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleAjouterConso(compte.id)}
                                title="Ajouter consommation"
                              >
                                <CirclePlus className="w-3.5 h-3.5 text-primary" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleEncaisser(compte.id)}
                                title="Encaisser"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-success" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => handleViewCompte(compte.id)}
                                title="Voir détails"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={reservation.status} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {canCheckIn(reservation.status) && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="default"
                                className="gap-1.5 bg-primary hover:bg-primary/90"
                                onClick={() => handleCheckIn(reservation.id)}
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                Check-in
                              </Button>
                              <HelpTooltip text="Enregistrer l'arrivée du client et créer son compte" side="left" />
                            </div>
                          )}
                          {canCheckOut(reservation.status) && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="gap-1.5"
                                onClick={() => handleCheckOut(reservation.id)}
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Check-out
                              </Button>
                              <HelpTooltip text="Enregistrer le départ du client (vérifie le solde)" side="left" />
                            </div>
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
                  );
                })}
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