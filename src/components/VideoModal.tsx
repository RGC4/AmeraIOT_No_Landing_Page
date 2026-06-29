'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VideoModalProps {
  /** Bunny Stream video library ID. Defaults to the account's main library. */
  bunnyLibraryId?: string;
  /** Bunny Stream video GUID (used when no self-hosted `src` is provided). */
  bunnyVideoId?: string;
  /** Self-hosted video file URL (e.g. /assets/videos/clip.mp4). Takes priority over Bunny. */
  src?: string;
  /** Optional poster image for the self-hosted player. */
  poster?: string;
  title?: string;
  children: React.ReactNode;
  triggerClassName?: string;
  triggerAriaLabel?: string;
}

export default function VideoModal({
  bunnyLibraryId = '692581',
  bunnyVideoId,
  src,
  poster,
  title = 'Video',
  children,
  triggerClassName,
  triggerAriaLabel,
}: VideoModalProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const embedSrc = `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyVideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={triggerAriaLabel ?? title}
        className={triggerClassName}
      >
        {children}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8 animate-[fadeIn_0.2s_ease-out]"
        >
          <div
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-[#0b1220] shadow-2xl ring-1 ring-white/10"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <p className="truncate text-sm font-semibold tracking-wide text-white">{title}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close video"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video */}
            <div className="relative aspect-video w-full bg-black">
              {src ? (
                <video
                  src={src}
                  poster={poster}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                  preload="metadata"
                />
              ) : (
                <iframe
                  src={embedSrc}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
