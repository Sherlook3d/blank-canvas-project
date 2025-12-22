// Hotel PMS Types - HotelManager

export type UserRole = 'owner' | 'manager' | 'receptionist';
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'out_of_service';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface Hotel {
  id: string;
  name: string;
  categoryStars: number;
  description: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  hotelId: string;
  name: string;
  username: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  avatarUrl?: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  capacityAdults: number;
  capacityChildren: number;
  basePrice: number;
  amenities: string[];
  description?: string;
}

export interface Room {
  id: string;
  hotelId: string;
  roomTypeId: string;
  roomType?: RoomType;
  number: string;
  floor: number;
  status: RoomStatus;
  notes?: string;
  imageUrl?: string;
}

export interface Guest {
  id: string;
  hotelId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferences?: string;
  isVip: boolean;
  tags: string[];
  totalStays: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  hotelId: string;
  code: string;
  guestId: string;
  guest?: Guest;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomTypeId: string;
  roomType?: RoomType;
  roomId?: string;
  room?: Room;
  totalAmount: number;
  currency: string;
  source: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  hotelId: string;
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  reference?: string;
}

export interface Invoice {
  id: string;
  hotelId: string;
  reservationId: string;
  number: string;
  pdfUrl?: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  issuedAt: string;
}

export interface ActivityLog {
  id: string;
  hotelId: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  diff?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  availableRooms: number;
  totalRooms: number;
  todayReservations: number;
  arrivals: number;
  departures: number;
  monthlyRevenue: number;
  currency: string;
  loyalClients: number;
  newClientsThisMonth: number;
  occupancyRate: number;
  occupancyChange: number;
}

export interface WeeklyOccupancy {
  day: string;
  rate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RoomTypeDistribution {
  name: string;
  value: number;
  color: string;
}
