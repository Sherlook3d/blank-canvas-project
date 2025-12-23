import { useState, useMemo } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel, Room, RoomStatus, RoomType, Client, Reservation } from '@/contexts/HotelContext';
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

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | RoomStatus;

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'available', label: 'Disponibles' },
  { value: 'occupied', label: 'Occupées' },
  { value: 'maintenance', label: 'Maintenance' },
];

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
};

const roomTypePrices: Record<RoomType, number> = {
  single: 80,
  double: 120,
  suite: 200,
  family: 180,
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

const Chambres = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: '',
    floor: 1,
    type: 'double' as RoomType,
    status: 'available' as RoomStatus,
  });
  const { rooms, reservations, isLoading, addRoom } = useHotel();

  // Get current occupant for a room
  const getOccupant = (roomId: string): { client: Client; reservation: Reservation } | null => {
    const activeReservation = reservations.find(
      r => r.room_id === roomId && r.status === 'checked_in' && r.client
    );
    if (activeReservation && activeReservation.client) {
      return { client: activeReservation.client, reservation: activeReservation };
    }
    return null;
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
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={() => setShowAddRoom(true)}
          >
            <Plus className="w-4 h-4" />
            Ajouter une chambre
          </Button>
        }
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
                {/* Room Image Placeholder */}
                <div className="relative h-36 bg-muted flex items-center justify-center">
                  <BedDouble className="w-14 h-14 text-muted-foreground/40" />
                  <StatusBadge 
                    status={room.status} 
                    className="absolute top-3 right-3"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-foreground/80 rounded text-xs font-medium text-background">
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

                  {/* Occupant Info */}
                  {room.status === 'occupied' && occupant && (
                    <div className="mb-3 p-2.5 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {occupant.client.first_name} {occupant.client.last_name}
                          </p>
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
                    </div>
                  )}
                  
                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
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
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="gap-1.5"
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
          <BedDouble className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-foreground mb-1">Aucune chambre trouvée</h3>
          <p className="text-sm text-muted-foreground">
            {rooms.length === 0 
              ? "Commencez par ajouter une chambre" 
              : "Essayez de modifier vos filtres ou votre recherche"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Chambres;
