import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

interface DebtBadgeProps {
  amount: number;
  showAmount?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function DebtBadge({ amount, showAmount = false, className, size = 'sm' }: DebtBadgeProps) {
  const { formatCurrency } = useCurrency();
  
  if (!amount || amount <= 0) return null;
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 bg-destructive/15 text-destructive font-medium rounded-full",
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        className
      )}
      title={`Impayé: ${formatCurrency(amount)}`}
    >
      <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {showAmount ? formatCurrency(amount) : 'Impayé'}
    </span>
  );
}
