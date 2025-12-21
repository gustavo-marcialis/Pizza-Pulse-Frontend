import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Recebido' | 'EmPreparo' | 'Pronto';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export function StatusBadge({ status, size = 'md', showPulse = true }: StatusBadgeProps) {
  const statusConfig = {
    Recebido: {
      label: 'Recebido',
      bgClass: 'bg-muted',
      textClass: 'text-muted-foreground',
      dotClass: 'bg-muted-foreground',
    },
    EmPreparo: {
      label: 'Em Preparo',
      bgClass: 'bg-secondary/20',
      textClass: 'text-cheese-dark',
      dotClass: 'bg-secondary',
    },
    Pronto: {
      label: 'Pronto',
      bgClass: 'bg-status-ready/20',
      textClass: 'text-status-ready',
      dotClass: 'bg-status-ready',
    },
  };

  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgClass,
        config.textClass,
        sizeClasses[size]
      )}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && status === 'EmPreparo' && (
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', config.dotClass)}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', config.dotClass)} />
      </span>
      {config.label}
    </span>
  );
}
