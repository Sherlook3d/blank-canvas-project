import { 
  Hotel, User, RoomType, Room, Guest, Reservation, 
  DashboardStats, WeeklyOccupancy, MonthlyRevenue, RoomTypeDistribution,
  RoomStatus, ReservationStatus
} from '@/types/hotel';

// Demo Hotel
export const demoHotel: Hotel = {
  id: 'hotel-001',
  name: 'Hôtel Colbert Antananarivo',
  categoryStars: 4,
  description: 'Situé au cœur d\'Antananarivo, notre hôtel offre un service exceptionnel et des chambres luxueuses pour un séjour inoubliable.',
  email: 'contact@hotelcolbert.mg',
  phone: '+261 20 22 123 45',
  address: 'Rue Prince Ratsimamanga, Antananarivo 101',
  timezone: 'Indian/Antananarivo',
  currency: 'MGA',
};

// Room Types (prices in Ariary)
export const roomTypes: RoomType[] = [
  {
    id: 'rt-001',
    hotelId: 'hotel-001',
    name: 'Simple',
    capacityAdults: 1,
    capacityChildren: 0,
    basePrice: 150000,
    amenities: ['Wi-Fi', 'Climatisation'],
  },
  {
    id: 'rt-002',
    hotelId: 'hotel-001',
    name: 'Double',
    capacityAdults: 2,
    capacityChildren: 1,
    basePrice: 250000,
    amenities: ['Wi-Fi', 'Climatisation', 'Minibar'],
  },
  {
    id: 'rt-003',
    hotelId: 'hotel-001',
    name: 'Deluxe',
    capacityAdults: 2,
    capacityChildren: 2,
    basePrice: 400000,
    amenities: ['Wi-Fi', 'Climatisation', 'Minibar', 'Baignoire'],
  },
  {
    id: 'rt-004',
    hotelId: 'hotel-001',
    name: 'Junior Suite',
    capacityAdults: 2,
    capacityChildren: 2,
    basePrice: 600000,
    amenities: ['Wi-Fi', 'Climatisation', 'Minibar', 'Baignoire', 'Salon'],
  },
  {
    id: 'rt-005',
    hotelId: 'hotel-001',
    name: 'Suite Royale',
    capacityAdults: 4,
    capacityChildren: 2,
    basePrice: 1000000,
    amenities: ['Wi-Fi', 'Climatisation', 'Minibar', 'Baignoire', 'Salon', 'Terrasse'],
  },
];

// Rooms
const roomsData: Array<Omit<Room, 'roomType'> & { status: RoomStatus }> = [
  { id: 'room-001', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '101', floor: 1, status: 'available' },
  { id: 'room-002', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '102', floor: 1, status: 'occupied' },
  { id: 'room-003', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '201', floor: 2, status: 'available' },
  { id: 'room-004', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '202', floor: 2, status: 'available' },
  { id: 'room-005', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '203', floor: 2, status: 'maintenance' },
  { id: 'room-006', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '204', floor: 2, status: 'occupied' },
  { id: 'room-007', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '205', floor: 2, status: 'available' },
  { id: 'room-008', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '301', floor: 3, status: 'occupied' },
  { id: 'room-009', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '302', floor: 3, status: 'available' },
  { id: 'room-010', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '303', floor: 3, status: 'available' },
  { id: 'room-011', hotelId: 'hotel-001', roomTypeId: 'rt-004', number: '401', floor: 4, status: 'occupied' },
  { id: 'room-012', hotelId: 'hotel-001', roomTypeId: 'rt-004', number: '402', floor: 4, status: 'available' },
  { id: 'room-013', hotelId: 'hotel-001', roomTypeId: 'rt-005', number: '501', floor: 5, status: 'available' },
  { id: 'room-014', hotelId: 'hotel-001', roomTypeId: 'rt-005', number: '502', floor: 5, status: 'occupied' },
  { id: 'room-015', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '103', floor: 1, status: 'available' },
  { id: 'room-016', hotelId: 'hotel-001', roomTypeId: 'rt-001', number: '104', floor: 1, status: 'available' },
  { id: 'room-017', hotelId: 'hotel-001', roomTypeId: 'rt-002', number: '206', floor: 2, status: 'available' },
  { id: 'room-018', hotelId: 'hotel-001', roomTypeId: 'rt-003', number: '304', floor: 3, status: 'available' },
  { id: 'room-019', hotelId: 'hotel-001', roomTypeId: 'rt-004', number: '403', floor: 4, status: 'maintenance' },
  { id: 'room-020', hotelId: 'hotel-001', roomTypeId: 'rt-005', number: '503', floor: 5, status: 'available' },
];

export const rooms: Room[] = roomsData.map(room => ({
  ...room,
  roomType: roomTypes.find(rt => rt.id === room.roomTypeId),
}));

// Guests (Malagasy names)
export const guests: Guest[] = [
  {
    id: 'guest-001',
    hotelId: 'hotel-001',
    firstName: 'Ravaka',
    lastName: 'Rasoanaivo',
    email: 'ravaka.rasoanaivo@gmail.com',
    phone: '+261 34 12 345 67',
    preferences: 'Préfère les chambres avec vue sur la ville',
    isVip: true,
    tags: ['VIP', 'Fidèle'],
    totalStays: 12,
    totalSpent: 9500000,
    lastVisit: '2025-12-22',
    createdAt: '2023-01-15',
  },
  {
    id: 'guest-002',
    hotelId: 'hotel-001',
    firstName: 'Hery',
    lastName: 'Andriamanantena',
    email: 'hery.andria@yahoo.fr',
    phone: '+261 33 23 456 78',
    isVip: false,
    tags: [],
    totalStays: 3,
    totalSpent: 1500000,
    lastVisit: '2025-11-15',
    createdAt: '2024-03-20',
  },
  {
    id: 'guest-003',
    hotelId: 'hotel-001',
    firstName: 'Voahirana',
    lastName: 'Rakotomalala',
    email: 'voahirana.r@gmail.com',
    phone: '+261 32 34 567 89',
    preferences: 'Chambre non-fumeur uniquement',
    isVip: true,
    tags: ['VIP'],
    totalStays: 8,
    totalSpent: 6400000,
    lastVisit: '2025-12-21',
    createdAt: '2023-06-10',
  },
  {
    id: 'guest-004',
    hotelId: 'hotel-001',
    firstName: 'Tojo',
    lastName: 'Razafindrakoto',
    email: 'tojo.razaf@outlook.com',
    phone: '+261 34 45 678 90',
    isVip: false,
    tags: [],
    totalStays: 2,
    totalSpent: 600000,
    lastVisit: '2025-12-20',
    createdAt: '2024-08-05',
  },
  {
    id: 'guest-005',
    hotelId: 'hotel-001',
    firstName: 'Miora',
    lastName: 'Randrianarisoa',
    email: 'miora.randria@gmail.com',
    phone: '+261 33 56 789 01',
    isVip: true,
    tags: ['VIP', 'Corporate'],
    totalStays: 15,
    totalSpent: 18000000,
    lastVisit: '2025-12-18',
    createdAt: '2022-11-22',
  },
  {
    id: 'guest-006',
    hotelId: 'hotel-001',
    firstName: 'Faniry',
    lastName: 'Rabemananjara',
    email: 'faniry.rabema@gmail.com',
    phone: '+261 32 67 890 12',
    isVip: false,
    tags: ['Entreprise'],
    totalStays: 1,
    totalSpent: 400000,
    lastVisit: '2025-10-10',
    createdAt: '2025-10-10',
  },
];

// Reservations
type ReservationData = {
  id: string;
  hotelId: string;
  code: string;
  guestId: string;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomTypeId: string;
  roomId?: string;
  totalAmount: number;
  currency: string;
  source: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
};

const reservationsData: ReservationData[] = [
  {
    id: 'res-001',
    hotelId: 'hotel-001',
    code: 'RES001',
    guestId: 'guest-001',
    status: 'confirmed',
    checkIn: '2025-12-22',
    checkOut: '2025-12-26',
    nights: 4,
    roomTypeId: 'rt-003',
    roomId: 'room-008',
    totalAmount: 1600000,
    currency: 'MGA',
    source: 'Direct',
    createdBy: 'user-001',
    createdAt: '2025-12-18',
  },
  {
    id: 'res-002',
    hotelId: 'hotel-001',
    code: 'RES002',
    guestId: 'guest-002',
    status: 'pending',
    checkIn: '2025-12-23',
    checkOut: '2025-12-25',
    nights: 2,
    roomTypeId: 'rt-002',
    totalAmount: 500000,
    currency: 'MGA',
    source: 'Booking.com',
    createdBy: 'user-002',
    createdAt: '2025-12-19',
  },
  {
    id: 'res-003',
    hotelId: 'hotel-001',
    code: 'RES003',
    guestId: 'guest-003',
    status: 'checked_in',
    checkIn: '2025-12-21',
    checkOut: '2025-12-24',
    nights: 3,
    roomTypeId: 'rt-004',
    roomId: 'room-011',
    totalAmount: 1800000,
    currency: 'MGA',
    source: 'Direct',
    createdBy: 'user-001',
    createdAt: '2025-12-15',
  },
  {
    id: 'res-004',
    hotelId: 'hotel-001',
    code: 'RES004',
    guestId: 'guest-004',
    status: 'checked_out',
    checkIn: '2025-12-20',
    checkOut: '2025-12-22',
    nights: 2,
    roomTypeId: 'rt-001',
    roomId: 'room-001',
    totalAmount: 300000,
    currency: 'MGA',
    source: 'Expedia',
    createdBy: 'user-003',
    createdAt: '2025-12-12',
  },
  {
    id: 'res-005',
    hotelId: 'hotel-001',
    code: 'RES005',
    guestId: 'guest-005',
    status: 'confirmed',
    checkIn: '2025-12-27',
    checkOut: '2025-12-30',
    nights: 3,
    roomTypeId: 'rt-005',
    totalAmount: 3000000,
    currency: 'MGA',
    source: 'Direct',
    createdBy: 'user-001',
    createdAt: '2025-12-20',
  },
  {
    id: 'res-006',
    hotelId: 'hotel-001',
    code: 'RES006',
    guestId: 'guest-006',
    status: 'cancelled',
    checkIn: '2025-12-24',
    checkOut: '2025-12-26',
    nights: 2,
    roomTypeId: 'rt-003',
    totalAmount: 800000,
    currency: 'MGA',
    source: 'Booking.com',
    notes: 'Annulé par le client',
    createdBy: 'user-002',
    createdAt: '2025-12-16',
  },
  {
    id: 'res-007',
    hotelId: 'hotel-001',
    code: 'RES007',
    guestId: 'guest-001',
    status: 'confirmed',
    checkIn: '2025-12-28',
    checkOut: '2025-12-31',
    nights: 3,
    roomTypeId: 'rt-005',
    totalAmount: 3000000,
    currency: 'MGA',
    source: 'Direct',
    createdBy: 'user-001',
    createdAt: '2025-12-21',
  },
  {
    id: 'res-008',
    hotelId: 'hotel-001',
    code: 'RES008',
    guestId: 'guest-002',
    status: 'pending',
    checkIn: '2025-12-29',
    checkOut: '2025-12-31',
    nights: 2,
    roomTypeId: 'rt-002',
    totalAmount: 500000,
    currency: 'MGA',
    source: 'Direct',
    createdBy: 'user-003',
    createdAt: '2025-12-22',
  },
];

export const reservations: Reservation[] = reservationsData.map(res => ({
  ...res,
  guest: guests.find(g => g.id === res.guestId),
  roomType: roomTypes.find(rt => rt.id === res.roomTypeId),
  room: rooms.find(r => r.id === res.roomId),
}));

// Users
export const users: User[] = [
  {
    id: 'user-001',
    hotelId: 'hotel-001',
    name: 'Jean Dupont',
    email: 'jean.dupont@grandhotel.com',
    role: 'owner',
    status: 'active',
    createdAt: '2023-01-01',
  },
  {
    id: 'user-002',
    hotelId: 'hotel-001',
    name: 'Claire Martin',
    email: 'claire.martin@grandhotel.com',
    role: 'manager',
    status: 'active',
    createdAt: '2023-03-15',
  },
  {
    id: 'user-003',
    hotelId: 'hotel-001',
    name: 'Paul Lefebvre',
    email: 'paul.lefebvre@grandhotel.com',
    role: 'receptionist',
    status: 'active',
    createdAt: '2024-01-10',
  },
];

// Dashboard Stats
export const dashboardStats: DashboardStats = {
  availableRooms: 12,
  totalRooms: 20,
  todayReservations: 8,
  arrivals: 4,
  departures: 4,
  monthlyRevenue: 52000000,
  currency: 'MGA',
  loyalClients: 156,
  newClientsThisMonth: 12,
  occupancyRate: 81,
  occupancyChange: 5,
};

// Weekly Occupancy Data
export const weeklyOccupancy: WeeklyOccupancy[] = [
  { day: 'Lun', rate: 65 },
  { day: 'Mar', rate: 72 },
  { day: 'Mer', rate: 78 },
  { day: 'Jeu', rate: 75 },
  { day: 'Ven', rate: 85 },
  { day: 'Sam', rate: 92 },
  { day: 'Dim', rate: 81 },
];

// Monthly Revenue Data (in millions Ariary)
export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Jan', revenue: 38000000 },
  { month: 'Fév', revenue: 42000000 },
  { month: 'Mar', revenue: 39000000 },
  { month: 'Avr', revenue: 47000000 },
  { month: 'Mai', revenue: 58000000 },
  { month: 'Juin', revenue: 70000000 },
  { month: 'Juil', revenue: 84000000 },
  { month: 'Août', revenue: 91000000 },
  { month: 'Sep', revenue: 76000000 },
  { month: 'Oct', revenue: 64000000 },
  { month: 'Nov', revenue: 57000000 },
  { month: 'Déc', revenue: 52000000 },
];

// Room Type Distribution
export const roomTypeDistribution: RoomTypeDistribution[] = [
  { name: 'Standard', value: 25, color: 'hsl(210, 20%, 80%)' },
  { name: 'Double', value: 35, color: 'hsl(213, 56%, 45%)' },
  { name: 'Deluxe', value: 20, color: 'hsl(213, 56%, 24%)' },
  { name: 'Suite', value: 20, color: 'hsl(38, 92%, 50%)' },
];

// Helper functions
export const formatCurrency = (amount: number, currency: string = 'MGA'): string => {
  if (currency === 'MGA') {
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' Ar';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatShortDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    checked_in: 'Arrivée',
    checked_out: 'Départ',
    cancelled: 'Annulée',
    no_show: 'No-show',
    available: 'Disponible',
    occupied: 'Occupée',
    maintenance: 'Maintenance',
    out_of_service: 'Hors service',
    owner: 'Propriétaire',
    manager: 'Gérant',
    receptionist: 'Réceptionniste',
  };
  return labels[status] || status;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    owner: 'Propriétaire',
    manager: 'Gérant',
    receptionist: 'Réceptionniste',
  };
  return labels[role] || role;
};
