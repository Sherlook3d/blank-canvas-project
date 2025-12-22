import { useState } from 'react';
import { BedDouble, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useHotel } from '@/contexts/HotelContext';
import { Reservation, Room } from '@/types/hotel';
import { roomTypes, formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface RoomSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onConfirm: (reservationId: string, roomId: string) => void;
}

export function RoomSelectionModal({ 
  open, 
  onOpenChange, 
  reservation,
  onConfirm 
}: RoomSelectionModalProps) {
  const { getAvailableRooms } = useHotel();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  if (!reservation) return null;

  const roomType = roomTypes.find(rt => rt.id === reservation.roomTypeId);
  const availableRooms = getAvailableRooms(reservation.roomTypeId);

  const handleConfirm = () => {
    if (selectedRoomId && reservation) {
      onConfirm(reservation.id, selectedRoomId);
      setSelectedRoomId(null);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRoomId(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5" />
            Sélectionner une chambre
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Reservation Info */}
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {reservation.guest?.firstName} {reservation.guest?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Réservation {reservation.code}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{roomType?.name}</p>
                <p className="text-sm text-muted-foreground">{reservation.nights} nuits</p>
              </div>
            </div>
          </div>

          {/* Available Rooms */}
          <p className="text-sm text-muted-foreground mb-3">
            {availableRooms.length} chambre{availableRooms.length > 1 ? 's' : ''} disponible{availableRooms.length > 1 ? 's' : ''}
          </p>

          {availableRooms.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {availableRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all text-left",
                    selectedRoomId === room.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  {selectedRoomId === room.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <BedDouble className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground text-lg">{room.number}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Étage {room.floor}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{roomType?.capacityAdults} adulte{(roomType?.capacityAdults || 0) > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BedDouble className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Aucune chambre disponible</p>
              <p className="text-sm text-muted-foreground">
                Toutes les chambres de ce type sont occupées
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedRoomId}
          >
            Confirmer le check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}