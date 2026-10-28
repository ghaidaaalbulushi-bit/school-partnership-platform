import type { Metadata } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });
const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'منصة توثيق الشراكة المدرسية | مدرسة أسماء بنت النعمان (1-8)',
  description: 'منصة توثيق الشراكة المدرسية لمدرسة أسماء بنت النعمان',
};

// Root layout only sets up html/body + fonts. The public site and the admin
// dashboard each have their own nested layout (src/app/(site)/layout.tsx and
// src/app/admin/layout.tsx) so the admin shell never renders the public
// header/footer, and vice versa.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="font-cairo bg-cream-50 text-navy-800 antialiased">{children}</body>
    </html>
  );
}
