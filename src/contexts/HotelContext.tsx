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
  total_depense?: number | null;
  argent_du?: number | null;
  nb_sejours?: number | null;
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
  compte_id?: string | null;
  acompte?: number | null;
  // Joined data
  room?: Room;
  client?: Client;
}

export interface NoteClient {
  id: string;
  client_id: string;
  hotel_id: string;
  type: 'Important' | 'Préférence' | 'Info';
  titre: string;
  contenu: string | null;
  alerte_checkin: boolean;
  created_at: string;
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
  checkIn: (reservationId: string) => Promise<{ success: boolean; alerts?: NoteClient[] }>;
  checkOut: (reservationId: string) => Promise<{ success: boolean; solde?: number; compteId?: string }>;
  // Utils
  getAvailableRooms: (type?: RoomType) => Room[];
  refreshData: () => Promise<void>;
  getClientAlerts: (clientId: string) => Promise<NoteClient[]>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const { profile, user } = useAuth();
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

  // Get client alerts for check-in
  const getClientAlerts = useCallback(async (clientId: string): Promise<NoteClient[]> => {
    try {
      const { data, error } = await supabase
        .from('notes_clients')
        .select('*')
        .eq('client_id', clientId)
        .eq('alerte_checkin', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as NoteClient[];
    } catch (error) {
      console.error('Error fetching client alerts:', error);
      return [];
    }
  }, []);

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

  // Reservation operations with debt alert
  const addReservation = useCallback(async (resData: Omit<Reservation, 'id' | 'hotel_id'>): Promise<boolean> => {
    if (!hotelId) return false;
    
    const { room, client, ...insertData } = resData;
    
    // Check if client has unpaid balances
    const clientData = clients.find(c => c.id === resData.client_id);
    if (clientData && (clientData.argent_du || 0) > 0) {
      toast({ 
        title: "⚠️ Attention: Client avec impayés",
        description: `${clientData.first_name} ${clientData.last_name} doit ${(clientData.argent_du || 0).toLocaleString()} Ar`,
        variant: "destructive",
        duration: 8000
      });
    }
    
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

  // Check-in with automatic account creation
  const checkIn = useCallback(async (reservationId: string): Promise<{ success: boolean; alerts?: NoteClient[] }> => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation || !hotelId || !user?.id) {
      return { success: false };
    }

    try {
      // 1. Get client alerts
      const alerts = await getClientAlerts(reservation.client_id);

      // 2. Calculate nights
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);
      const nbNuits = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const prixNuitee = reservation.room?.price_per_night || 0;
      const acompte = reservation.acompte || 0;

      // 3. Create compte client
      const { data: nouveauCompte, error: compteError } = await supabase
        .from('comptes_clients')
        .insert({
          reservation_id: reservationId,
          client_id: reservation.client_id,
          hotel_id: hotelId,
          created_by: user.id
        })
        .select()
        .single();

      if (compteError) throw compteError;

      // 4. Add nuitées to compte
      const nuitees = [];
      for (let i = 0; i < nbNuits; i++) {
        nuitees.push({
          compte_id: nouveauCompte.id,
          type: 'Nuitée',
          description: `Nuitée ${i + 1}/${nbNuits}`,
          montant: prixNuitee,
          ajoute_par: user.id
        });
      }

      if (nuitees.length > 0) {
        const { error: lignesError } = await supabase
          .from('lignes_compte')
          .insert(nuitees);
        if (lignesError) throw lignesError;
      }

      // 5. Add acompte if exists
      if (acompte > 0) {
        const { error: paiementError } = await supabase
          .from('paiements_compte')
          .insert({
            compte_id: nouveauCompte.id,
            montant: acompte,
            methode: 'Acompte',
            remarque: 'Acompte réservation',
            recu_par: user.id
          });
        if (paiementError) throw paiementError;
      }

      // 6. Update reservation with compte_id
      await supabase
        .from('reservations')
        .update({ compte_id: nouveauCompte.id })
        .eq('id', reservationId);

      // 7. Update room to occupied
      await updateRoomStatus(reservation.room_id, 'occupied');
      
      // 8. Update reservation status
      const success = await updateReservation(reservationId, { 
        status: 'checked_in',
        compte_id: nouveauCompte.id
      });
      
      if (success) {
        const totalNuitees = nbNuits * prixNuitee;
        const solde = totalNuitees - acompte;
        toast({ 
          title: "Check-in effectué", 
          description: `Chambre ${reservation.room?.number} • Compte ${nouveauCompte.numero} créé${solde > 0 ? ` • Solde: ${solde.toLocaleString()} Ar` : ''}`
        });

        // Show alerts if any
        if (alerts.length > 0) {
          alerts.forEach((alert, index) => {
            setTimeout(() => {
              toast({ 
                title: `⚠️ Alerte: ${alert.titre}`,
                description: alert.contenu || undefined,
                variant: "destructive"
              });
            }, (index + 1) * 1000);
          });
        }
      }
      
      await refreshData();
      return { success, alerts };

    } catch (error: any) {
      console.error('Check-in error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { success: false };
    }
  }, [reservations, hotelId, user?.id, updateRoomStatus, updateReservation, getClientAlerts, refreshData]);

  // Check-out with balance verification
  const checkOut = useCallback(async (reservationId: string): Promise<{ success: boolean; solde?: number; compteId?: string }> => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (!reservation) {
      return { success: false };
    }

    try {
      // Get compte and check solde
      if (reservation.compte_id) {
        const { data: compte, error } = await supabase
          .from('comptes_clients')
          .select('id, solde')
          .eq('id', reservation.compte_id)
          .single();

        if (!error && compte && compte.solde > 0) {
          // Return with solde to block checkout
          return { 
            success: false, 
            solde: compte.solde,
            compteId: compte.id
          };
        }
      }

      // Update room to cleaning
      await updateRoomStatus(reservation.room_id, 'cleaning');
      
      // Update reservation status
      const success = await updateReservation(reservationId, { status: 'checked_out' });
      
      if (success) {
        toast({ title: "Check-out effectué", description: `Chambre ${reservation.room?.number} à nettoyer` });
      }
      
      await refreshData();
      return { success };

    } catch (error: any) {
      console.error('Check-out error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { success: false };
    }
  }, [reservations, updateRoomStatus, updateReservation, refreshData]);

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
      getClientAlerts,
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