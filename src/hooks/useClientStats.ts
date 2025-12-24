import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Client, Reservation } from '@/contexts/HotelContext';

interface ClientStats {
  totalDays: number;
  totalSpent: number;
}

export const useClientStats = (
  clientId: string, 
  reservations: Reservation[]
): ClientStats => {
  return useMemo(() => {
    const clientReservations = reservations.filter(r => r.client_id === clientId);
    
    let totalDays = 0;
    let totalSpent = 0;

    clientReservations.forEach(res => {
      // Count days for completed or in-progress stays
      if (res.status === 'checked_out' || res.status === 'checked_in') {
        const checkIn = parseISO(res.check_in);
        const checkOut = parseISO(res.check_out);
        const days = differenceInDays(checkOut, checkIn);
        totalDays += days > 0 ? days : 1;
      }
      
      // Sum up paid amounts
      if (res.payment_status === 'paid') {
        totalSpent += res.total_price || 0;
      }
    });

    return { totalDays, totalSpent };
  }, [clientId, reservations]);
};

export const getClientStats = (
  clientId: string, 
  reservations: Reservation[]
): ClientStats => {
  const clientReservations = reservations.filter(r => r.client_id === clientId);
  
  let totalDays = 0;
  let totalSpent = 0;

  clientReservations.forEach(res => {
    if (res.status === 'checked_out' || res.status === 'checked_in') {
      const checkIn = parseISO(res.check_in);
      const checkOut = parseISO(res.check_out);
      const days = differenceInDays(checkOut, checkIn);
      totalDays += days > 0 ? days : 1;
    }
    
    if (res.payment_status === 'paid') {
      totalSpent += res.total_price || 0;
    }
  });

  return { totalDays, totalSpent };
};
