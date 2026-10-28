import Image from 'next/image';

/**
 * Renders the school's original logo, unmodified, at its natural aspect
 * ratio. `src` comes from site_settings.logo_storage_path when the admin
 * has replaced it via the dashboard; otherwise falls back to the shipped
 * original file at /public/logo/school-logo-original.png (the exact file
 * provided for this project).
 */
export function SchoolLogo({
  src,
  size = 56,
  className,
}: {
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={src || '/logo/school-logo-original.png'}
      alt="شعار مدرسة أسماء بنت النعمان"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
