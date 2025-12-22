import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Room, Reservation, RoomStatus, ReservationStatus } from '@/types/hotel';
import { 
  rooms as initialRooms, 
  reservations as initialReservations,
  roomTypes,
  guests
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface HotelContextType {
  rooms: Room[];
  reservations: Reservation[];
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;
  checkIn: (reservationId: string, roomId?: string) => boolean;
  checkOut: (reservationId: string) => boolean;
  getAvailableRooms: (roomTypeId: string) => Room[];
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  const updateRoomStatus = useCallback((roomId: string, status: RoomStatus) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status } : room
    ));
  }, []);

  const updateReservationStatus = useCallback((reservationId: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(res => 
      res.id === reservationId ? { ...res, status } : res
    ));
  }, []);

  const getAvailableRooms = useCallback((roomTypeId: string): Room[] => {
    return rooms.filter(room => 
      room.roomTypeId === roomTypeId && room.status === 'available'
    );
  }, [rooms]);

  const checkIn = useCallback((reservationId: string, roomId?: string): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation) {
      toast({
        title: "Erreur",
        description: "Réservation non trouvée",
        variant: "destructive"
      });
      return false;
    }

    if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
      toast({
        title: "Erreur",
        description: "Cette réservation ne peut pas être enregistrée",
        variant: "destructive"
      });
      return false;
    }

    // Get or assign room
    let assignedRoomId = roomId || reservation.roomId;
    
    if (!assignedRoomId) {
      const availableRooms = getAvailableRooms(reservation.roomTypeId);
      if (availableRooms.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucune chambre disponible pour ce type",
          variant: "destructive"
        });
        return false;
      }
      assignedRoomId = availableRooms[0].id;
    }

    const room = rooms.find(r => r.id === assignedRoomId);
    if (!room || room.status !== 'available') {
      toast({
        title: "Erreur", 
        description: "La chambre n'est pas disponible",
        variant: "destructive"
      });
      return false;
    }

    // Update room status
    setRooms(prev => prev.map(r => 
      r.id === assignedRoomId ? { ...r, status: 'occupied' as RoomStatus } : r
    ));

    // Update reservation
    setReservations(prev => prev.map(res => 
      res.id === reservationId 
        ? { 
            ...res, 
            status: 'checked_in' as ReservationStatus,
            roomId: assignedRoomId,
            room: rooms.find(r => r.id === assignedRoomId)
          } 
        : res
    ));

    toast({
      title: "Check-in effectué",
      description: `Chambre ${room.number} assignée à ${reservation.guest?.firstName} ${reservation.guest?.lastName}`,
    });

    return true;
  }, [reservations, rooms, getAvailableRooms]);

  const checkOut = useCallback((reservationId: string): boolean => {
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation) {
      toast({
        title: "Erreur",
        description: "Réservation non trouvée",
        variant: "destructive"
      });
      return false;
    }

    if (reservation.status !== 'checked_in') {
      toast({
        title: "Erreur",
        description: "Cette réservation n'est pas en cours",
        variant: "destructive"
      });
      return false;
    }

    const roomId = reservation.roomId;

    // Update room status
    if (roomId) {
      setRooms(prev => prev.map(r => 
        r.id === roomId ? { ...r, status: 'available' as RoomStatus } : r
      ));
    }

    // Update reservation
    setReservations(prev => prev.map(res => 
      res.id === reservationId 
        ? { ...res, status: 'checked_out' as ReservationStatus } 
        : res
    ));

    const room = rooms.find(r => r.id === roomId);
    toast({
      title: "Check-out effectué",
      description: `Chambre ${room?.number || ''} maintenant disponible`,
    });

    return true;
  }, [reservations, rooms]);

  return (
    <HotelContext.Provider value={{ 
      rooms, 
      reservations, 
      updateRoomStatus, 
      updateReservationStatus,
      checkIn,
      checkOut,
      getAvailableRooms
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
