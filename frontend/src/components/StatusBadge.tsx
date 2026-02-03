import { Check, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from '@/lib/api';

interface StatusBadgeProps {
  status: VerificationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    VERIFIED: {
      label: 'Verified',
      icon: Check,
      className: 'bg-verified-bg text-verified',
    },
    FLAGGED: {
      label: 'Flagged',
      icon: AlertCircle,
      className: 'bg-flagged-bg text-flagged',
    },
    MISSING: {
      label: 'Missing',
      icon: HelpCircle,
      className: 'bg-missing-bg text-missing',
    },
  };

  const { label, icon: Icon, className: statusClassName } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
        statusClassName,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
