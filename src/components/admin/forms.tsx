'use client';

import { useFormStatus } from 'react-dom';
import { Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-navy-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows ?? 4} className={cn(inputClass, 'resize-y', props.className)} />;
}

export function SubmitButton({ children = 'حفظ' }: { children?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sky-600 disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function FormMessage({ message, variant }: { message?: string; variant?: 'success' | 'error' }) {
  if (!message) return null;
  return (
    <p
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-semibold',
        variant === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-mint-50 text-mint-700'
      )}
    >
      {message}
    </p>
  );
}
