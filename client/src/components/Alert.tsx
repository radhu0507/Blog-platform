import type { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info';

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

/** Inline message box for form errors, success notices and hints. */
export function Alert({ variant = 'error', children }: AlertProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </div>
  );
}