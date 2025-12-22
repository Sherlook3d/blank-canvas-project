import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

// Types
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';
export type RoomType = 'single' | 'double' | 'suite' | 'family';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface Hotel {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface Room {
  id: string;
  hotel_id: string;
  number: string;
  type: RoomType;
  capacity: number;
  price_per_night: number;
  status: RoomStatus;
  amenities: string[];
  floor: number | null;
  description: string | null;
}

export interface Client {
  id: string;
  hotel_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_type: string | null;
  id_number: string | null;
  nationality: string | null;
  notes: string | null;
  vip: boolean;
}

export interface Reservation {
  id: string;
  hotel_id: string;
  room_id: string;
  client_id: string;
  check_in: string;
  check_out: string;
  status: ReservationStatus;
  total_price: number;
  payment_status: PaymentStatus;
  notes: string | null;
  // Joined data
  room?: Room;
  client?: Client;
}

interface HotelContextType {
  hotel: Hotel | null;
  rooms: Room[];
  clients: Client[];
  reservations: Reservation[];
  isLoading: boolean;
  // Room operations
  addRoom: (room: Omit<Room, 'id' | 'hotel_id'>) => Promise<boolean>;
  updateRoom: (id: string, data: Partial<Room>) => Promise<boolean>;
  deleteRoom: (id: string) => Promise<boolean>;
  updateRoomStatus: (roomId: string, status: RoomStatus) => Promise<boolean>;
  // Client operations
  addClient: (client: Omit<Client, 'id' | 'hotel_id'>) => Promise<Client | null>;
  updateClient: (id: string, data: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  // Reservation operations
  addReservation: (reservation: Omit<Reservation, 'id' | 'hotel_id'>) => Promise<boolean>;
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<boolean>;
  deleteReservation: (id: string) => Promise<boolean>;
  checkIn: (reservationId: string) => Promise<boolean>;
  checkOut: (reservationId: string) => Promise<boolean>;
  // Utils
  getAvailableRooms: (type?: RoomType) => Room[];
  refreshData: () => Promise<void>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const hotelId = profile?.hotel_id;

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!hotelId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch hotel
      const { data: hotelData } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .maybeSingle();
      
      setHotel(hotelData);

      // Fetch rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('number');
      
      setRooms((roomsData || []) as Room[]);

      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('last_name');
      
      setClients((clientsData || []) as Client[]);

      // Fetch reservations with joined data
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('check_in', { ascending: false });
      
      // Join room and client data
      const reservationsWithJoins = (reservationsData || []).map(res => ({
        ...res,
        room: (roomsData || []).find(r => r.id === res.room_id),
        client: (clientsData || []).find(c => c.id === res.client_id),
      })) as Reservation[];
      
      setReservations(reservationsWithJoins);
    } catch (error) {
      console.error('Error fetching hotel data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Room operations
  const addRoom = useCallback(async (roomData: Omit<Room, 'id' | 'hotel_id'>): Promise<boolean> => {
    if (!hotelId) return false;
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({ ...roomData, hotel_id: hotelId })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setRooms(prev => [...prev, data as Room]);
    toast({ title: "Succès", description: "Chambre ajoutée" });
    return true;
  }, [hotelId]);

  const updateRoom = useCallback(async (id: string, data: Partial<Room>): Promise<boolean> => {
    const { error } = await supabase
      .from('rooms')
      .update(data)
      .eq('id', id);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    return true;
  }, []);

  const deleteRoom = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setRooms(prev => prev.filter(r => r.id !== id));
    toast({ title: "Succès", description: "Chambre supprimée" });
    return true;
  }, []);

  const updateRoomStatus = useCallback(async (roomId: string, status: RoomStatus): Promise<boolean> => {
    return updateRoom(roomId, { status });
  }, [updateRoom]);

  // Client operations
  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'hotel_id'>): Promise<Client | null> => {
    if (!hotelId) return null;
    
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...clientData, hotel_id: hotelId })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return null;
    }
    
    const newClient = data as Client;
    setClients(prev => [...prev, newClient]);
    toast({ title: "Succès", description: "Client ajouté" });
    return newClient;
  }, [hotelId]);

  const updateClient = useCallback(async (id: string, data: Partial<Client>): Promise<boolean> => {
    const { error } = await supabase
      .from('clients')
      .update(data)
      .eq('id', id);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    return true;
  }, []);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setClients(prev => prev.filter(c => c.id !== id));
    toast({ title: "Succès", description: "Client supprimé" });
    return true;
  }, []);

  // Reservation operations
  const addReservation = useCallback(async (resData: Omit<Reservation, 'id' | 'hotel_id'>): Promise<boolean> => {
    if (!hotelId) return false;
    
    const { room, client, ...insertData } = resData;
    
    const { data, error } = await supabase
      .from('reservations')
      .insert({ ...insertData, hotel_id: hotelId })
      .select()
      .single();
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    const newRes: Reservation = {
      ...data,
      room: rooms.find(r => r.id === data.room_id),
      client: clients.find(c => c.id === data.client_id),
    } as Reservation;
    
    setReservations(prev => [newRes, ...prev]);
    toast({ title: "Succès", description: "Réservation créée" });
    return true;
  }, [hotelId, rooms, clients]);

  const updateReservation = useCallback(async (id: string, data: Partial<Reservation>): Promise<boolean> => {
    const { room, client, ...updateData } = data;
    
    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    return true;
  }, []);

  const deleteReservation = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    
    setReservations(prev => prev.filter(r => r.id !== id));
    toast({ title: "Succès", description: "Réservation supprimée" });
    return true;
  }, []);

  const checkIn = useCallback(async (reservationId: string): Promise<boolean> => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return false;

    // Update room to occupied
    await updateRoomStatus(reservation.room_id, 'occupied');
    
    // Update reservation status
    const success = await updateReservation(reservationId, { status: 'checked_in' });
    
    if (success) {
      toast({ title: "Check-in effectué", description: `Chambre ${reservation.room?.number}` });
    }
    
    return success;
  }, [reservations, updateRoomStatus, updateReservation]);

  const checkOut = useCallback(async (reservationId: string): Promise<boolean> => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) return false;

    // Update room to available
    await updateRoomStatus(reservation.room_id, 'available');
    
    // Update reservation status
    const success = await updateReservation(reservationId, { status: 'checked_out' });
    
    if (success) {
      toast({ title: "Check-out effectué", description: `Chambre ${reservation.room?.number} disponible` });
    }
    
    return success;
  }, [reservations, updateRoomStatus, updateReservation]);

  const getAvailableRooms = useCallback((type?: RoomType): Room[] => {
    return rooms.filter(room => {
      const isAvailable = room.status === 'available';
      const matchesType = !type || room.type === type;
      return isAvailable && matchesType;
    });
  }, [rooms]);

  return (
    <HotelContext.Provider value={{ 
      hotel,
      rooms, 
      clients,
      reservations, 
      isLoading,
      addRoom,
      updateRoom,
      deleteRoom,
      updateRoomStatus,
      addClient,
      updateClient,
      deleteClient,
      addReservation,
      updateReservation,
      deleteReservation,
      checkIn,
      checkOut,
      getAvailableRooms,
      refreshData,
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
