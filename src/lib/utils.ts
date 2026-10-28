import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArabicDate(dateString: string | null): string {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' }).format(
      new Date(dateString)
    );
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
}
