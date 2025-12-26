import { Wallet, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface BalanceBadgeProps {
  totalPrice: number;
  acompte?: number;
  soldeCompte?: number; // Remaining balance from compte_client
  showDetails?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Badge displaying the payment status for a reservation:
 * - Shows remaining balance if there's an acompte/advance payment
 * - Shows "Payé" if fully paid
 * - Shows remaining balance in red if unpaid
 */
export function BalanceBadge({ 
  totalPrice, 
  acompte = 0, 
  soldeCompte,
  showDetails = false, 
  className, 
  size = 'sm' 
}: BalanceBadgeProps) {
  const { formatCurrency } = useCurrency();
  
  // Use soldeCompte if available (more accurate), otherwise calculate from acompte
  const resteAPayer = soldeCompte !== undefined ? soldeCompte : (totalPrice - acompte);
  const isPaid = resteAPayer <= 0;
  const hasAdvance = acompte > 0 && !isPaid;
  
  if (isPaid) {
    return (
      <span 
        className={cn(
          "inline-flex items-center gap-1 bg-success/15 text-success font-medium rounded-full",
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
          className
        )}
      >
        <CreditCard className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        Payé
      </span>
    );
  }
  
  if (hasAdvance) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn(
              "inline-flex items-center gap-1 bg-warning/15 text-warning font-medium rounded-full cursor-help",
              size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
              className
            )}
          >
            <Wallet className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            {showDetails ? `Reste: ${formatCurrency(resteAPayer)}` : formatCurrency(resteAPayer)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>Total: {formatCurrency(totalPrice)}</p>
            <p className="text-success">Avance: {formatCurrency(acompte)}</p>
            <p className="text-warning font-semibold">Reste: {formatCurrency(resteAPayer)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  // No payment made yet
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 bg-destructive/15 text-destructive font-medium rounded-full",
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        className
      )}
      title={`À payer: ${formatCurrency(resteAPayer)}`}
    >
      <Wallet className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {formatCurrency(resteAPayer)}
    </span>
  );
}
