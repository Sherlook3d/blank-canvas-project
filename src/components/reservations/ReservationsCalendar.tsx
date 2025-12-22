import { useState, useMemo, useCallback } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHotel } from '@/contexts/HotelContext';
import { Reservation } from '@/types/hotel';
import { cn } from '@/lib/utils';

type ViewMode = 'week' | 'month';

interface ReservationsCalendarProps {
  onViewChange?: (view: 'list' | 'calendar') => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/80',
  confirmed: 'bg-primary/80',
  checked_in: 'bg-emerald-500/80',
  checked_out: 'bg-muted-foreground/50',
  cancelled: 'bg-destructive/50',
};

export function ReservationsCalendar({ onViewChange }: ReservationsCalendarProps) {
  const { reservations, updateReservationStatus } = useHotel();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [draggedReservation, setDraggedReservation] = useState<Reservation | null>(null);

  const days = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { locale: fr });
      const end = endOfWeek(currentDate, { locale: fr });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const monthDays = eachDayOfInterval({ start, end });
      
      // Add days from previous month to start on Monday
      const firstDayOfMonth = startOfMonth(currentDate);
      const startOfFirstWeek = startOfWeek(firstDayOfMonth, { locale: fr });
      const prefixDays = eachDayOfInterval({ start: startOfFirstWeek, end: firstDayOfMonth }).slice(0, -1);
      
      // Add days from next month to complete the grid
      const lastDayOfMonth = endOfMonth(currentDate);
      const endOfLastWeek = endOfWeek(lastDayOfMonth, { locale: fr });
      const suffixDays = eachDayOfInterval({ start: lastDayOfMonth, end: endOfLastWeek }).slice(1);
      
      return [...prefixDays, ...monthDays, ...suffixDays];
    }
  }, [currentDate, viewMode]);

  const getReservationsForDay = useCallback((day: Date) => {
    return reservations.filter(res => {
      if (res.status === 'cancelled') return false;
      const checkIn = parseISO(res.checkIn);
      const checkOut = parseISO(res.checkOut);
      return isWithinInterval(day, { start: checkIn, end: checkOut }) || 
             isSameDay(day, checkIn) || 
             isSameDay(day, checkOut);
    });
  }, [reservations]);

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleDragStart = (e: React.DragEvent, reservation: Reservation) => {
    setDraggedReservation(reservation);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedReservation) return;

    // In a real app, this would update the reservation dates
    console.log(`Moving reservation ${draggedReservation.code} to ${format(targetDate, 'yyyy-MM-dd')}`);
    setDraggedReservation(null);
  };

  const handleDragEnd = () => {
    setDraggedReservation(null);
  };

  const headerLabel = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { locale: fr });
      const end = endOfWeek(currentDate, { locale: fr });
      return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(currentDate, 'MMMM yyyy', { locale: fr });
  }, [currentDate, viewMode]);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground ml-4 capitalize">
            {headerLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-colors",
                viewMode === 'week' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-colors",
                viewMode === 'month' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Mois
            </button>
          </div>

          {onViewChange && (
            <Button variant="outline" size="sm" onClick={() => onViewChange('list')}>
              <List className="w-4 h-4 mr-2" />
              Liste
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="gravity-card p-0 overflow-hidden">
        {/* Day Headers */}
        <div className={cn(
          "grid border-b border-border bg-muted/30",
          viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'
        )}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={cn(
          "grid",
          viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'
        )}>
          {days.map((day, index) => {
            const dayReservations = getReservationsForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={index}
                className={cn(
                  "border-r border-b border-border last:border-r-0 transition-colors",
                  viewMode === 'week' ? 'min-h-[200px]' : 'min-h-[120px]',
                  !isCurrentMonth && viewMode === 'month' && 'bg-muted/20',
                  draggedReservation && 'hover:bg-primary/5'
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                {/* Day Number */}
                <div className="p-2 flex items-center justify-between">
                  <span className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-full text-sm",
                    isToday && 'bg-primary text-primary-foreground font-semibold',
                    !isToday && !isCurrentMonth && 'text-muted-foreground/50',
                    !isToday && isCurrentMonth && 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayReservations.length > 0 && viewMode === 'month' && (
                    <span className="text-xs text-muted-foreground">
                      {dayReservations.length}
                    </span>
                  )}
                </div>

                {/* Reservations */}
                <div className="px-1 pb-1 space-y-1">
                  {dayReservations.slice(0, viewMode === 'week' ? 10 : 3).map((reservation) => {
                    const isCheckIn = isSameDay(parseISO(reservation.checkIn), day);
                    const isCheckOut = isSameDay(parseISO(reservation.checkOut), day);

                    return (
                      <div
                        key={reservation.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, reservation)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "px-2 py-1 rounded text-xs text-white cursor-move truncate transition-all",
                          statusColors[reservation.status] || 'bg-primary/80',
                          "hover:ring-2 hover:ring-primary/50 hover:scale-[1.02]",
                          draggedReservation?.id === reservation.id && 'opacity-50'
                        )}
                        title={`${reservation.guest?.firstName} ${reservation.guest?.lastName} - ${reservation.roomType?.name}`}
                      >
                        {isCheckIn && '→ '}
                        {reservation.guest?.lastName}
                        {isCheckOut && ' →'}
                        {viewMode === 'week' && (
                          <span className="opacity-75 ml-1">
                            {reservation.roomType?.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {dayReservations.length > (viewMode === 'week' ? 10 : 3) && (
                    <div className="px-2 py-0.5 text-xs text-muted-foreground">
                      +{dayReservations.length - (viewMode === 'week' ? 10 : 3)} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500/80" />
          <span>En attente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/80" />
          <span>Confirmée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/80" />
          <span>En cours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted-foreground/50" />
          <span>Terminée</span>
        </div>
      </div>
    </div>
  );
}