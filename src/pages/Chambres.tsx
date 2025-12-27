import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  BedDouble, 
  Users, 
  Wifi, 
  Wind, 
  Wine, 
  Bath,
  LayoutGrid,
  List,
  Edit2,
  User,
  ExternalLink,
  ShoppingCart,
  Wallet,
  Sparkles,
  Wrench,
  CheckCircle,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DebtBadge } from '@/components/ui/DebtBadge';
import { useHotel, Room, RoomStatus, RoomType, Client, Reservation } from '@/contexts/HotelContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RoomDetailsDialog } from '@/components/rooms/RoomDetailsDialog';
import { NewReservationDialog } from '@/components/reservations/NewReservationDialog';
import { AjouterConsommationDialog } from '@/components/comptes/AjouterConsommationDialog';
import { EncaisserDialog } from '@/components/comptes/EncaisserDialog';
import { useComptes, CompteClient } from '@/hooks/useComptes';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | RoomStatus;

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'available', label: 'Disponibles' },
  { value: 'occupied', label: 'Occupées' },
  { value: 'cleaning', label: 'Nettoyage' },
  { value: 'maintenance', label: 'Maintenance' },
];

// Duration in minutes before cleaning rooms become available
const CLEANING_DURATION_MINUTES = 30;

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
  bungalow: 'Bungalow',
};

const roomTypePrices: Record<RoomType, number> = {
  single: 80000,
  double: 120000,
  suite: 200000,
  family: 180000,
  bungalow: 20000,
};

const amenityIcons: Record<string, React.ElementType> = {
  '1 Lit (2 places)': BedDouble,
  '1 Lit (1 place)': BedDouble,
  Ventilateur: Wind,
  'Climatiseur': Wind,
  'WiFi': Wifi,
  'TV Canal+': Wine,
  'Eau chaude': Bath,
};

const Chambres = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [roomToBook, setRoomToBook] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState({
    number: '',
    floor: 1,
    type: 'double' as RoomType,
    status: 'available' as RoomStatus,
  });
  const { rooms, reservations, isLoading, addRoom, updateRoomStatus, refreshData } = useHotel();
  const { comptes, ajouterConsommation, refreshComptes } = useComptes();
  
  // Track cleaning start times
  const [cleaningTimers, setCleaningTimers] = useState<Record<string, number>>({});

  // Auto-change cleaning rooms to available after CLEANING_DURATION_MINUTES
  useEffect(() => {
    const cleaningRooms = rooms.filter(r => r.status === 'cleaning');
    
    cleaningRooms.forEach(room => {
      if (!cleaningTimers[room.id]) {
        // Set cleaning start time for new cleaning rooms
        setCleaningTimers(prev => ({ ...prev, [room.id]: Date.now() }));
      }
    });
    
    // Check every 30 seconds for rooms to change to available
    const interval = setInterval(() => {
      const now = Date.now();
      Object.entries(cleaningTimers).forEach(([roomId, startTime]) => {
        const room = rooms.find(r => r.id === roomId);
        if (room?.status === 'cleaning') {
          const elapsedMinutes = (now - startTime) / 1000 / 60;
          if (elapsedMinutes >= CLEANING_DURATION_MINUTES) {
            updateRoomStatus(roomId, 'available');
            setCleaningTimers(prev => {
              const updated = { ...prev };
              delete updated[roomId];
              return updated;
            });
          }
        } else {
          // Room is no longer cleaning, remove timer
          setCleaningTimers(prev => {
            const updated = { ...prev };
            delete updated[roomId];
            return updated;
          });
        }
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [rooms, cleaningTimers, updateRoomStatus]);

  // Get remaining cleaning time
  const getCleaningTimeRemaining = useCallback((roomId: string): number | null => {
    const startTime = cleaningTimers[roomId];
    if (!startTime) return null;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const remaining = Math.max(0, CLEANING_DURATION_MINUTES - elapsed);
    return Math.ceil(remaining);
  }, [cleaningTimers]);

  // Quick status change handlers
  const handleSetCleaning = async (roomId: string) => {
    const success = await updateRoomStatus(roomId, 'cleaning');
    if (success) {
      setCleaningTimers(prev => ({ ...prev, [roomId]: Date.now() }));
    }
  };

  const handleSetMaintenance = async (roomId: string) => {
    await updateRoomStatus(roomId, 'maintenance');
  };

  const handleSetAvailable = async (roomId: string) => {
    await updateRoomStatus(roomId, 'available');
    setCleaningTimers(prev => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };
  
  // State for consumption/payment dialogs
  const [showConsommation, setShowConsommation] = useState(false);
  const [showEncaisser, setShowEncaisser] = useState(false);
  const [selectedCompte, setSelectedCompte] = useState<CompteClient | null>(null);

  // Get current occupant for a room
  const getOccupant = (roomId: string): { client: Client; reservation: Reservation; compte: CompteClient | null } | null => {
    const activeReservation = reservations.find(
      r => r.room_id === roomId && r.status === 'checked_in' && r.client
    );
    if (activeReservation && activeReservation.client) {
      // Find associated compte
      const compte = comptes.find(c => c.reservation_id === activeReservation.id && c.statut === 'Ouvert') || null;
      return { client: activeReservation.client, reservation: activeReservation, compte };
    }
    return null;
  };

  // Handle add consumption
  const handleAddConsommation = (compte: CompteClient) => {
    setSelectedCompte(compte);
    setShowConsommation(true);
  };

  // Handle payment
  const handleEncaisser = (compte: CompteClient) => {
    setSelectedCompte(compte);
    setShowEncaisser(true);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roomTypeLabels[room.type]?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || room.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const handleAddRoom = async () => {
    const success = await addRoom({
      number: newRoom.number,
      floor: newRoom.floor,
      type: newRoom.type,
      status: newRoom.status,
      capacity: newRoom.type === 'single' ? 1 : newRoom.type === 'family' ? 4 : 2,
      price_per_night: roomTypePrices[newRoom.type],
      amenities: ['Wi-Fi', 'Climatisation'],
      description: null,
    });
    
    if (success) {
      setShowAddRoom(false);
      setNewRoom({ number: '', floor: 1, type: 'double', status: 'available' });
    }
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleRoomDetailsClose = (open: boolean) => {
    setShowRoomDetails(open);
    if (!open) {
      refreshData();
    }
  };

  const handleBookRoom = (room: Room) => {
    setRoomToBook(room);
    setShowNewReservation(true);
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
        title="Chambres"
        subtitle={`${rooms.length} chambres • ${statusCounts.available} disponibles`}
        actions={
          <Button 
            variant="gradient"
            className="gap-2"
            onClick={() => setShowAddRoom(true)}
          >
            <Plus className="w-4 h-4" />
            Ajouter une chambre
          </Button>
        }
      />

      {/* Room Details Dialog */}
      <RoomDetailsDialog
        room={selectedRoom}
        open={showRoomDetails}
        onOpenChange={handleRoomDetailsClose}
      />

      {/* New Reservation Dialog */}
      <NewReservationDialog
        open={showNewReservation}
        onOpenChange={setShowNewReservation}
      />

      {/* Consommation Dialog */}
      <AjouterConsommationDialog
        open={showConsommation}
        onOpenChange={setShowConsommation}
        compte={selectedCompte}
      />

      {/* Encaisser Dialog */}
      <EncaisserDialog
        open={showEncaisser}
        onOpenChange={setShowEncaisser}
        compte={selectedCompte}
      />

      {/* Add Room Dialog */}
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une chambre</DialogTitle>
            <DialogDescription>Créer une nouvelle chambre dans votre hôtel</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="number">Numéro de chambre</Label>
              <Input
                id="number"
                value={newRoom.number}
                onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                placeholder="101"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="floor">Étage</Label>
              <Input
                id="floor"
                type="number"
                value={newRoom.floor}
                onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type de chambre</Label>
              <Select value={newRoom.type} onValueChange={(v) => setNewRoom({ ...newRoom, type: v as RoomType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Simple</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="family">Familiale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={newRoom.status} onValueChange={(v) => setNewRoom({ ...newRoom, status: v as RoomStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoom(false)}>Annuler</Button>
            <Button onClick={handleAddRoom} disabled={!newRoom.number}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search, Filters, and View Toggle */}
      <div className="gravity-card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une chambre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
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
                  <span className="ml-1.5 text-xs opacity-70">
                    ({statusCounts[filter.value]})
                  </span>
                </button>
              ))}
            </div>
            
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
      </div>

      {/* Rooms Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
          {filteredRooms.map((room) => {
            const occupant = getOccupant(room.id);
            
            return (
              <div key={room.id} className="room-card">
                {/* Room Visual Header */}
                <div className="relative h-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-t-xl overflow-hidden border-b border-border/60 shadow-sm">
                  <div className="absolute top-3 left-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center shadow-sm">
                      <BedDouble className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] text-muted-foreground">{roomTypeLabels[room.type]}</span>
                      <span className="text-sm font-semibold text-foreground">Chambre {room.number}</span>
                    </div>
                  </div>
                  <StatusBadge 
                    status={room.status} 
                    className="absolute top-3 right-3"
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-background/95 border border-border/70 rounded text-xs font-medium text-foreground shadow-sm">
                    {formatCurrency(room.price_per_night)}/nuit
                  </div>
                </div>
                
                {/* Room Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{roomTypeLabels[room.type]} {room.number}</h4>
                      <p className="text-sm text-muted-foreground">{roomTypeLabels[room.type]} • Étage {room.floor}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity}</span>
                    </div>
                  </div>

                  {/* Occupant Info with Quick Actions */}
                  {room.status === 'occupied' && occupant && (
                    <div className="mb-3 p-2.5 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">
                              {occupant.client.first_name} {occupant.client.last_name}
                            </p>
                            <DebtBadge amount={occupant.client.argent_du || 0} />
                          </div>
                          <p className="text-xs text-muted-foreground">Occupant actuel</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-accent hover:text-accent hover:bg-accent/20"
                          onClick={() => navigate(`/clients?highlight=${occupant.client.id}`)}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {/* Quick Account Actions */}
                      {occupant.compte && (
                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent/20"
                            onClick={() => handleAddConsommation(occupant.compte!)}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Consommation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-accent/30 text-accent hover:bg-accent/20"
                            onClick={() => handleEncaisser(occupant.compte!)}
                          >
                            <Wallet className="w-3 h-3" />
                            Encaisser
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {room.amenities.slice(0, 4).map((amenity) => {
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

                  {/* Quick Status Actions - Always visible for non-occupied rooms */}
                  {room.status !== 'occupied' && (
                    <div className="flex gap-1.5 mb-3">
                      {room.status === 'cleaning' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                            onClick={() => handleSetAvailable(room.id)}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Disponible
                          </Button>
                          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 rounded">
                            <Timer className="w-3 h-3" />
                            {getCleaningTimeRemaining(room.id) || CLEANING_DURATION_MINUTES} min
                          </div>
                        </>
                      ) : room.status === 'maintenance' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                            onClick={() => handleSetAvailable(room.id)}
                          >
                            <CheckCircle className="w-3 h-3" />
                            Disponible
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => handleSetCleaning(room.id)}
                          >
                            <Sparkles className="w-3 h-3" />
                            Nettoyage
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => handleSetCleaning(room.id)}
                          >
                            <Sparkles className="w-3 h-3" />
                            Nettoyage
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs gap-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                            onClick={() => handleSetMaintenance(room.id)}
                          >
                            <Wrench className="w-3 h-3" />
                            Maintenance
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={room.status === 'available' ? "gradient" : "secondary"}
                      className="flex-1"
                      disabled={room.status !== 'available'}
                      onClick={() => handleBookRoom(room)}
                    >
                      Réserver
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(room)}>
                      Détails
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="gravity-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gravity-table">
              <thead className="bg-muted/30">
                <tr>
                  <th>Chambre</th>
                  <th>Type</th>
                  <th>Étage</th>
                  <th>Capacité</th>
                  <th>Prix/nuit</th>
                  <th>Statut</th>
                  <th>Occupant</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => {
                  const occupant = getOccupant(room.id);
                  
                  return (
                    <tr key={room.id} className="group">
                      <td>
                        <p className="font-medium text-foreground">{room.number}</p>
                      </td>
                      <td>
                        <p className="text-foreground">{roomTypeLabels[room.type]}</p>
                      </td>
                      <td>
                        <p className="text-muted-foreground">{room.floor}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{room.capacity} pers.</span>
                        </div>
                      </td>
                      <td>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(room.price_per_night)}
                        </p>
                      </td>
                      <td>
                        <StatusBadge status={room.status} />
                      </td>
                      <td>
                        {room.status === 'occupied' && occupant ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {occupant.client.first_name} {occupant.client.last_name}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-accent hover:text-accent hover:bg-accent/20"
                              onClick={() => navigate(`/clients?highlight=${occupant.client.id}`)}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 flex-wrap">
                          {room.status !== 'occupied' && (
                            <>
                              {room.status === 'cleaning' ? (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                    onClick={() => handleSetAvailable(room.id)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Dispo
                                  </Button>
                                  <span className="text-xs text-amber-600 flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {getCleaningTimeRemaining(room.id) || CLEANING_DURATION_MINUTES}m
                                  </span>
                                </>
                              ) : room.status === 'maintenance' ? (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                    onClick={() => handleSetAvailable(room.id)}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Dispo
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                    onClick={() => handleSetCleaning(room.id)}
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Nettoyage
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                    onClick={() => handleSetCleaning(room.id)}
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Nettoyage
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                    onClick={() => handleSetMaintenance(room.id)}
                                  >
                                    <Wrench className="w-3.5 h-3.5" />
                                    Maint.
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleViewDetails(room)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Modifier
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRooms.length === 0 && (
        <div className="gravity-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BedDouble className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Aucune chambre trouvée</h3>
          <p className="text-sm text-muted-foreground">
            {rooms.length === 0 
              ? "Ajoutez votre première chambre" 
              : "Essayez de modifier vos filtres ou votre recherche"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Chambres;
