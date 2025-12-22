import { useState } from 'react';
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
  MoreVertical,
  Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel } from '@/contexts/HotelContext';
import { RoomDetailsModal } from '@/components/chambres/RoomDetailsModal';
import { roomTypes, formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Room, RoomStatus } from '@/types/hotel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | RoomStatus;

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'available', label: 'Disponibles' },
  { value: 'occupied', label: 'Occupées' },
  { value: 'maintenance', label: 'Maintenance' },
];

const amenityIcons: Record<string, React.ElementType> = {
  'Wi-Fi': Wifi,
  'Climatisation': Wind,
  'Minibar': Wine,
  'Baignoire': Bath,
};

const Chambres = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { rooms } = useHotel();

  const roomsWithTypes = rooms.map(room => ({
    ...room,
    roomType: roomTypes.find(rt => rt.id === room.roomTypeId),
  }));

  const filteredRooms = roomsWithTypes.filter((room) => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomType?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || room.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const handleOpenDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Chambres"
        subtitle={`${rooms.length} chambres • ${statusCounts.available} disponibles`}
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une chambre
          </Button>
        }
      />

      <RoomDetailsModal 
        open={showDetails} 
        onOpenChange={setShowDetails} 
        room={selectedRoom}
      />

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
          {filteredRooms.map((room) => (
            <div key={room.id} className="room-card">
              {/* Room Image Placeholder */}
              <div className="relative h-36 bg-muted flex items-center justify-center">
                <BedDouble className="w-14 h-14 text-muted-foreground/40" />
                <StatusBadge 
                  status={room.status} 
                  className="absolute top-3 right-3"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-foreground/80 rounded text-xs font-medium text-background">
                  {formatCurrency(room.roomType?.basePrice || 0)}/nuit
                </div>
              </div>
              
              {/* Room Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{room.roomType?.name} {room.number}</h4>
                    <p className="text-sm text-muted-foreground">{room.roomType?.name} • Étage {room.floor}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{room.roomType?.capacityAdults}</span>
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.roomType?.amenities.slice(0, 4).map((amenity) => {
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDetails(room)}
                  >
                    Détails
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="group">
                    <td>
                      <p className="font-medium text-foreground">{room.number}</p>
                    </td>
                    <td>
                      <p className="text-foreground">{room.roomType?.name}</p>
                    </td>
                    <td>
                      <p className="text-muted-foreground">{room.floor}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{room.roomType?.capacityAdults} adultes</span>
                      </div>
                    </td>
                    <td>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(room.roomType?.basePrice || 0)}
                      </p>
                    </td>
                    <td>
                      <StatusBadge status={room.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleOpenDetails(room)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Modifier
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default Chambres;