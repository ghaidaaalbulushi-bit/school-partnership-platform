export function VideoPlayer({ src, title }: { src: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-navy-900 shadow-card">
      <video controls preload="metadata" className="aspect-video w-full" title={title}>
        <source src={src} />
        متصفحك لا يدعم تشغيل الفيديو مباشرة. يمكنك تحميل الملف بدلًا من ذلك.
      </video>
    </div>
  );
}
