import { useState, useEffect } from 'react';
import { BedDouble, Users, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useHotel } from '@/contexts/HotelContext';
import { Room, RoomStatus } from '@/types/hotel';
import { roomTypes, formatCurrency } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface RoomDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
}

export function RoomDetailsModal({ open, onOpenChange, room }: RoomDetailsModalProps) {
  const { updateRoomStatus } = useHotel();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState<Partial<Room>>({});

  useEffect(() => {
    if (room) {
      setEditedRoom({
        number: room.number,
        floor: room.floor,
        status: room.status,
        notes: room.notes || '',
      });
    }
    setIsEditing(false);
  }, [room]);

  if (!room) return null;

  const roomType = roomTypes.find(rt => rt.id === room.roomTypeId);

  const handleSave = () => {
    if (editedRoom.status && editedRoom.status !== room.status) {
      updateRoomStatus(room.id, editedRoom.status);
    }
    
    toast({
      title: "Chambre mise à jour",
      description: `Chambre ${room.number} modifiée avec succès`,
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRoom({
      number: room.number,
      floor: room.floor,
      status: room.status,
      notes: room.notes || '',
    });
    setIsEditing(false);
  };

  const statusOptions: { value: RoomStatus; label: string }[] = [
    { value: 'available', label: 'Disponible' },
    { value: 'occupied', label: 'Occupée' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'out_of_service', label: 'Hors service' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BedDouble className="w-5 h-5" />
              Chambre {room.number}
            </DialogTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Room Type Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-lg">{roomType?.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Users className="w-4 h-4" />
                  <span>{roomType?.capacityAdults} adulte{(roomType?.capacityAdults || 0) > 1 ? 's' : ''}</span>
                  {(roomType?.capacityChildren || 0) > 0 && (
                    <span>• {roomType?.capacityChildren} enfant{(roomType?.capacityChildren || 0) > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCurrency(roomType?.basePrice || 0)}</p>
                <p className="text-sm text-muted-foreground">par nuit</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Room Number */}
            <div className="space-y-2">
              <Label>Numéro de chambre</Label>
              {isEditing ? (
                <Input
                  value={editedRoom.number || ''}
                  onChange={(e) => setEditedRoom(prev => ({ ...prev, number: e.target.value }))}
                />
              ) : (
                <p className="text-foreground font-medium">{room.number}</p>
              )}
            </div>

            {/* Floor */}
            <div className="space-y-2">
              <Label>Étage</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedRoom.floor || ''}
                  onChange={(e) => setEditedRoom(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                />
              ) : (
                <p className="text-foreground font-medium">Étage {room.floor}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Statut</Label>
              {isEditing ? (
                <Select
                  value={editedRoom.status}
                  onValueChange={(value) => setEditedRoom(prev => ({ ...prev, status: value as RoomStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <StatusBadge status={room.status} />
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              {isEditing ? (
                <Textarea
                  value={editedRoom.notes || ''}
                  onChange={(e) => setEditedRoom(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ajouter des notes sur cette chambre..."
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {room.notes || 'Aucune note'}
                </p>
              )}
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>Équipements</Label>
              <div className="flex flex-wrap gap-2">
                {roomType?.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2.5 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}