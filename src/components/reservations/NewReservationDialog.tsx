import { useState, useMemo, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { DebtBadge } from '@/components/ui/DebtBadge';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useHotel, Client, Room, RoomType } from '@/contexts/HotelContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedRoomId?: string;
}

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
  bungalow: 'Bungalow',
};

export function NewReservationDialog({ open, onOpenChange, preSelectedRoomId }: NewReservationDialogProps) {
  const { clients, rooms, addReservation, getAvailableRooms } = useHotel();
  const { formatCurrency } = useCurrency();
  
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>(preSelectedRoomId || '');
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 1));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update selected room when preSelectedRoomId changes
  useEffect(() => {
    if (preSelectedRoomId && open) {
      setSelectedRoom(preSelectedRoomId);
    }
  }, [preSelectedRoomId, open]);

  // Calculate available rooms
  const availableRooms = useMemo(() => {
    return getAvailableRooms();
  }, [getAvailableRooms]);

  // Calculate total price
  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = selectedRoomData ? selectedRoomData.price_per_night * nights : 0;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !selectedRoom || !checkIn || !checkOut) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await addReservation({
      client_id: selectedClient,
      room_id: selectedRoom,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      status: 'pending',
      payment_status: 'pending',
      total_price: totalPrice,
      notes: notes || null,
    });

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setSelectedClient('');
      setSelectedRoom('');
      setCheckIn(new Date());
      setCheckOut(addDays(new Date(), 1));
      setNotes('');
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setSelectedClient('');
    setSelectedRoom('');
    setCheckIn(new Date());
    setCheckOut(addDays(new Date(), 1));
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
          <DialogDescription>
            Créez une nouvelle réservation pour un client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <span>{client.first_name} {client.last_name}</span>
                      {client.vip && (
                        <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">VIP</span>
                      )}
                      <DebtBadge amount={client.argent_du || 0} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room">Chambre *</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une chambre" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Aucune chambre disponible
                  </div>
                ) : (
                  availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>
                          {roomTypeLabels[room.type]} - N°{room.number}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(room.price_per_night)}/nuit
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arrivée *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, 'dd MMM yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      setCheckIn(date);
                      if (date && checkOut && date >= checkOut) {
                        setCheckOut(addDays(date, 1));
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Départ *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, 'dd MMM yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => !checkIn || date <= checkIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Summary */}
          {selectedRoomData && nights > 0 && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Durée</span>
                <span>{nights} nuit{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix/nuit</span>
                <span>{formatCurrency(selectedRoomData.price_per_night)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes optionnelles pour cette réservation..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedClient || !selectedRoom || !checkIn || !checkOut || nights <= 0 || isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer la réservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}