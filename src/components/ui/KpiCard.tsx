import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: 'green' | 'orange' | 'blue' | 'yellow';
  className?: string;
}

const iconColorClasses = {
  green: 'bg-hotel-green-light text-success',
  orange: 'bg-hotel-orange-light text-accent',
  blue: 'bg-hotel-blue-light text-info',
  yellow: 'bg-hotel-yellow-light text-warning',
};

export function KpiCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  iconColor = 'blue',
  className 
}: KpiCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <div className={cn('kpi-card', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          iconColorClasses[iconColor]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPositive 
              ? 'text-success bg-hotel-green-light' 
              : 'text-destructive bg-hotel-red-light'
          )}>
            <span>{isPositive ? '↗' : '↘'}</span>
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
