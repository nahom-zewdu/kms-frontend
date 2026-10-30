import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="kms-card px-6 py-12 text-center">
      {Icon && <Icon className="mx-auto mb-4 h-7 w-7 text-zinc-600" />}
      <h2 className="text-base font-medium text-zinc-100">{title}</h2>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
