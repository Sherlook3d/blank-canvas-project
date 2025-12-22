import { useState } from 'react';
import { BedDouble, Plus } from 'lucide-react';
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
import { useHotel } from '@/contexts/HotelContext';
import { RoomStatus } from '@/types/hotel';
import { roomTypes, formatCurrency } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoomModal({ open, onOpenChange }: AddRoomModalProps) {
  const { addRoom } = useHotel();
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [status, setStatus] = useState<RoomStatus>('available');
  const [notes, setNotes] = useState('');

  const selectedRoomType = roomTypes.find(rt => rt.id === roomTypeId);

  const isValid = roomNumber.trim() && floor && roomTypeId;

  const handleSubmit = () => {
    if (!isValid) return;

    addRoom({
      number: roomNumber.trim(),
      floor: parseInt(floor),
      roomTypeId,
      status,
      notes: notes.trim() || undefined,
    });

    toast({
      title: "Chambre ajoutée",
      description: `Chambre ${roomNumber} (${selectedRoomType?.name}) créée avec succès`,
    });

    // Reset form
    setRoomNumber('');
    setFloor('');
    setRoomTypeId('');
    setStatus('available');
    setNotes('');
    onOpenChange(false);
  };

  const statusOptions: { value: RoomStatus; label: string }[] = [
    { value: 'available', label: 'Disponible' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'out_of_service', label: 'Hors service' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter une chambre
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Room Type */}
          <div className="space-y-2">
            <Label>Type de chambre *</Label>
            <Select value={roomTypeId} onValueChange={setRoomTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{rt.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatCurrency(rt.basePrice)}/nuit
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Room Type Info */}
          {selectedRoomType && (
            <div className="bg-muted/30 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Capacité</span>
                <span className="text-foreground">
                  {selectedRoomType.capacityAdults} adulte{selectedRoomType.capacityAdults > 1 ? 's' : ''}
                  {selectedRoomType.capacityChildren > 0 && `, ${selectedRoomType.capacityChildren} enfant${selectedRoomType.capacityChildren > 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Équipements</span>
                <span className="text-foreground text-xs">
                  {selectedRoomType.amenities.slice(0, 3).join(', ')}
                  {selectedRoomType.amenities.length > 3 && '...'}
                </span>
              </div>
            </div>
          )}

          {/* Room Number and Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Numéro de chambre *</Label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Ex: 101"
              />
            </div>
            <div className="space-y-2">
              <Label>Étage *</Label>
              <Input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Ex: 1"
                min={0}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Statut initial</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as RoomStatus)}>
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
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires sur la chambre..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}