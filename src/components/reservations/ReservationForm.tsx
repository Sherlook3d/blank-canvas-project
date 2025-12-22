import { useState, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, User, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHotel } from '@/contexts/HotelContext';
import { roomTypes, guests, formatCurrency } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ReservationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReservationForm({ open, onOpenChange }: ReservationFormProps) {
  const { getAvailableRooms } = useHotel();
  
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [newGuestMode, setNewGuestMode] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');

  const selectedRoomType = roomTypes.find(rt => rt.id === selectedRoomTypeId);
  const availableRooms = selectedRoomTypeId ? getAvailableRooms(selectedRoomTypeId) : [];

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, differenceInDays(checkOut, checkIn));
  }, [checkIn, checkOut]);

  const totalAmount = useMemo(() => {
    if (!selectedRoomType || nights <= 0) return 0;
    return selectedRoomType.basePrice * nights;
  }, [selectedRoomType, nights]);

  const isValid = useMemo(() => {
    const hasGuest = selectedGuestId || (newGuestMode && newGuestName && newGuestEmail);
    return checkIn && checkOut && nights > 0 && selectedRoomTypeId && hasGuest && availableRooms.length > 0;
  }, [checkIn, checkOut, nights, selectedRoomTypeId, selectedGuestId, newGuestMode, newGuestName, newGuestEmail, availableRooms]);

  const handleSubmit = () => {
    if (!isValid) return;

    // In a real app, this would create the reservation in the database
    toast({
      title: "Réservation créée",
      description: `${nights} nuits pour ${formatCurrency(totalAmount)} - ${selectedRoomType?.name}`,
    });

    // Reset form
    setCheckIn(undefined);
    setCheckOut(undefined);
    setSelectedRoomTypeId('');
    setSelectedGuestId('');
    setNewGuestMode(false);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('');
    onOpenChange(false);
  };

  const handleCheckInSelect = (date: Date | undefined) => {
    setCheckIn(date);
    // If checkout is before or equal to checkin, clear it
    if (date && checkOut && checkOut <= date) {
      setCheckOut(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5" />
            Nouvelle réservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date d'arrivée</Label>
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
                    {checkIn ? format(checkIn, "d MMM yyyy", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={handleCheckInSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de départ</Label>
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
                    {checkOut ? format(checkOut, "d MMM yyyy", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => !checkIn || date <= checkIn}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {nights > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              {nights} nuit{nights > 1 ? 's' : ''}
            </p>
          )}

          {/* Room Type */}
          <div className="space-y-2">
            <Label>Type de chambre</Label>
            <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => {
                  const available = getAvailableRooms(rt.id).length;
                  return (
                    <SelectItem key={rt.id} value={rt.id} disabled={available === 0}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{rt.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatCurrency(rt.basePrice)}/nuit • {available} dispo
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedRoomTypeId && availableRooms.length === 0 && (
              <p className="text-sm text-destructive">Aucune chambre disponible pour ce type</p>
            )}
          </div>

          {/* Guest Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Client</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-auto py-1"
                onClick={() => {
                  setNewGuestMode(!newGuestMode);
                  setSelectedGuestId('');
                }}
              >
                {newGuestMode ? 'Client existant' : '+ Nouveau client'}
              </Button>
            </div>

            {newGuestMode ? (
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <Input
                  placeholder="Nom complet"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Téléphone"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                />
              </div>
            ) : (
              <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{guest.firstName} {guest.lastName}</span>
                        {guest.isVip && (
                          <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">VIP</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Price Summary */}
          {selectedRoomType && nights > 0 && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedRoomType.name} × {nights} nuit{nights > 1 ? 's' : ''}
                </span>
                <span>{formatCurrency(selectedRoomType.basePrice * nights)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Créer la réservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}