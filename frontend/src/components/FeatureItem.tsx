import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureItemProps {
  title: string;
  description: string;
  className?: string;
}

export function FeatureItem({ title, description, className }: FeatureItemProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
