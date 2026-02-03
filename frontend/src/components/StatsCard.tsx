import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'verified' | 'flagged' | 'accent';
  className?: string;
}

export function StatsCard({ label, value, variant = 'default', className }: StatsCardProps) {
  const valueColors = {
    default: 'text-foreground',
    verified: 'text-verified',
    flagged: 'text-flagged',
    accent: 'text-primary',
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('text-2xl font-bold', valueColors[variant])}>{value}</p>
    </div>
  );
}
