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
  green: 'bg-success/15 text-success',
  orange: 'bg-accent/15 text-accent',
  blue: 'bg-info/15 text-info',
  yellow: 'bg-warning/15 text-warning',
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
    <div className={cn(
      'kpi-card group relative overflow-hidden',
      // Glassmorphism effect for dark themes
      'dark:bg-card/60 dark:backdrop-blur-xl dark:border-white/10',
      // Neumorphism effect for light themes
      'light:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]',
      className
    )}>
      {/* Gradient glow effect for dark themes */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none">
        <div 
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to)))',
          }}
        />
      </div>
      
      {/* Subtle border gradient for dark themes */}
      <div className="absolute inset-0 rounded-xl opacity-0 dark:opacity-100 pointer-events-none">
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--accent) / 0.1), transparent 50%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
            // Glass effect on icon background for dark themes
            'dark:backdrop-blur-sm',
            iconColorClasses[iconColor]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              'dark:backdrop-blur-sm',
              isPositive 
                ? 'text-success bg-success/15 dark:bg-success/20' 
                : 'text-destructive bg-destructive/15 dark:bg-destructive/20'
            )}>
              <span>{isPositive ? '↗' : '↘'}</span>
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, hsl(var(--accent) / 0.05) 45%, transparent 50%)',
          }}
        />
      </div>
    </div>
  );
}
