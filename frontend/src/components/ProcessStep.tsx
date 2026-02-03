import { cn } from '@/lib/utils';

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  className?: string;
}

export function ProcessStep({ step, title, description, className }: ProcessStepProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-sm',
        className
      )}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
        {step}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
