import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reservation, RoomType } from '@/contexts/HotelContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReservationsCalendarProps {
  reservations: Reservation[];
}

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Simple',
  double: 'Double',
  suite: 'Suite',
  family: 'Familiale',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-success/80 hover:bg-success',
  pending: 'bg-warning/80 hover:bg-warning',
  checked_in: 'bg-accent/80 hover:bg-accent',
  checked_out: 'bg-muted-foreground/50 hover:bg-muted-foreground/70',
  cancelled: 'bg-destructive/50 hover:bg-destructive/70',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  checked_in: 'En cours',
  checked_out: 'Terminée',
  cancelled: 'Annulée',
};

export function ReservationsCalendar({ reservations }: ReservationsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: fr });
  const calendarEnd = endOfWeek(monthEnd, { locale: fr });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  // Get reservations for a specific day
  const getReservationsForDay = (day: Date) => {
    return reservations.filter((res) => {
      if (res.status === 'cancelled') return false;
      const checkIn = parseISO(res.check_in);
      const checkOut = parseISO(res.check_out);
      return isWithinInterval(day, { start: checkIn, end: addDays(checkOut, -1) });
    });
  };

  // Check if day is check-in or check-out
  const getDayType = (day: Date, reservation: Reservation) => {
    const checkIn = parseISO(reservation.check_in);
    const checkOut = parseISO(reservation.check_out);
    
    if (isSameDay(day, checkIn)) return 'check-in';
    if (isSameDay(day, checkOut)) return 'check-out';
    return 'stay';
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="gravity-card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Aujourd'hui
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(statusLabels).filter(([key]) => key !== 'cancelled').map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded', statusColors[status])} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-medium text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayReservations = getReservationsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[100px] p-1 border-b border-r border-border last:border-r-0',
                  !isCurrentMonth && 'bg-muted/30',
                  index % 7 === 6 && 'border-r-0'
                )}
              >
                {/* Day number */}
                <div className="flex justify-end mb-1">
                  <span
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                      isToday && 'bg-primary text-primary-foreground font-bold',
                      !isCurrentMonth && 'text-muted-foreground/50'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Reservations */}
                <div className="space-y-1">
                  <TooltipProvider>
                    {dayReservations.slice(0, 3).map((reservation) => {
                      const dayType = getDayType(day, reservation);
                      
                      return (
                        <Tooltip key={reservation.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded text-white font-medium truncate cursor-pointer transition-colors',
                                statusColors[reservation.status],
                                dayType === 'check-in' && 'rounded-l-full ml-0.5',
                                dayType === 'check-out' && 'rounded-r-full mr-0.5'
                              )}
                            >
                              {dayType === 'check-in' && '→ '}
                              {reservation.room?.number}
                              {dayType === 'check-out' && ' →'}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">
                                {reservation.client?.first_name} {reservation.client?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Chambre {reservation.room?.number} - {reservation.room?.type ? roomTypeLabels[reservation.room.type] : ''}
                              </p>
                              <p className="text-xs">
                                {format(parseISO(reservation.check_in), 'dd MMM', { locale: fr })} → {format(parseISO(reservation.check_out), 'dd MMM', { locale: fr })}
                              </p>
                              <div className="flex items-center gap-1 text-xs">
                                <span className={cn('w-2 h-2 rounded-full', statusColors[reservation.status])} />
                                <span>{statusLabels[reservation.status]}</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                  
                  {dayReservations.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{dayReservations.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-foreground">{reservations.filter(r => r.status !== 'cancelled').length}</strong> réservations
          </span>
        </div>
      </div>
    </div>
  );
}