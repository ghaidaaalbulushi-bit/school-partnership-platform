'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronRight, ChevronLeft, ZoomIn } from 'lucide-react';

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string | null;
}

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(() => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)), [images.length]);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') next(); // RTL: left arrow = next in reading order
      if (e.key === 'ArrowRight') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, close, next, prev]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-sky-100"
          >
            <Image src={img.url} alt={img.alt} fill className="object-cover transition group-hover:scale-105" sizes="200px" />
            <span className="absolute inset-0 flex items-center justify-center bg-navy-900/0 transition group-hover:bg-navy-900/30">
              <ZoomIn className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/90 p-4" role="dialog" aria-modal>
          <button onClick={close} className="absolute end-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="إغلاق">
            <X className="h-6 w-6" />
          </button>
          <button onClick={next} className="absolute end-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="الصورة التالية">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={prev} className="absolute start-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="الصورة السابقة">
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={images[openIndex]!.url}
              alt={images[openIndex]!.alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {images[openIndex]!.caption && (
            <p className="absolute bottom-6 text-center text-sm text-white/80">{images[openIndex]!.caption}</p>
          )}
        </div>
      )}
    </>
  );
}
