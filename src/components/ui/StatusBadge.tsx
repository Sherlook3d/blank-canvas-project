import { cn } from '@/lib/utils';

type StatusType = 
  | 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out' | 'no_show'
  | 'available' | 'occupied' | 'maintenance' | 'out_of_service'
  | 'owner' | 'manager' | 'receptionist';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Reservation statuses
  confirmed: { label: 'Confirmée', className: 'badge-confirmed' },
  pending: { label: 'En attente', className: 'badge-pending' },
  cancelled: { label: 'Annulée', className: 'badge-cancelled' },
  checked_in: { label: 'Arrivée', className: 'badge-arrived' },
  checked_out: { label: 'Départ', className: 'badge-departed' },
  no_show: { label: 'No-show', className: 'badge-cancelled' },
  
  // Room statuses
  available: { label: 'Disponible', className: 'badge-available' },
  occupied: { label: 'Occupée', className: 'badge-occupied' },
  maintenance: { label: 'Maintenance', className: 'badge-maintenance' },
  out_of_service: { label: 'Hors service', className: 'badge-cancelled' },
  
  // Role badges
  owner: { label: 'Propriétaire', className: 'badge-owner' },
  manager: { label: 'Gérant', className: 'badge-manager' },
  receptionist: { label: 'Réceptionniste', className: 'badge-receptionist' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge-departed' };
  
  return (
    <span className={cn('badge-status', config.className, className)}>
      {config.label}
    </span>
  );
}
