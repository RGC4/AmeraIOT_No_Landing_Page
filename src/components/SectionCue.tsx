import React from 'react';
import VideoModal from './VideoModal';

const iconCircle = (
  <span className="flex h-[29px] w-[29px] sm:h-[36px] sm:w-[36px] flex-shrink-0 items-center justify-center rounded-full bg-[#114D8F] text-white shadow-sm transition-colors group-hover:bg-[#0e4179] group-focus-visible:ring-2 group-focus-visible:ring-[#114D8F]/50 group-focus-visible:ring-offset-2">
    <svg className="h-[16px] w-[16px] sm:h-[19px] sm:w-[19px] translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  </span>
);

const pillClass =
  'inline-flex items-center rounded-full border border-[#2D74C4] bg-[#F3F9FE] px-[12px] py-[6px] sm:px-[15px] sm:py-[7px] text-[8.5px] sm:text-[9.9px] font-bold uppercase tracking-[0.07em] text-[#2D74C4] shadow-sm transition-colors group-hover:bg-[#E8F3FD] sm:whitespace-nowrap';

const wrapperClass = 'group mb-4 inline-flex max-w-full items-center gap-[9px] sm:gap-[11px]';

interface SectionCueProps {
  label: React.ReactNode;
  /** Bunny Stream video library ID (optional — defaults to the account's main library). */
  bunnyLibraryId?: string;
  /** Bunny Stream video GUID — when provided the cue becomes a clickable video trigger. */
  bunnyVideoId?: string;
  /** Self-hosted video URL — alternative to Bunny. */
  src?: string;
  /** External link — when provided the cue becomes a link (opens in a new tab) instead of a video trigger. */
  href?: string;
  /** Accessible title for the video modal / aria-label. */
  title?: string;
  className?: string;
}

export default function SectionCue({ label, bunnyLibraryId, bunnyVideoId, src, href, title, className = '' }: SectionCueProps) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title ? `Open: ${title}` : undefined}
        className={`${wrapperClass} focus:outline-none ${className}`}
      >
        {iconCircle}
        <span className={pillClass}>{label}</span>
      </a>
    );
  }

  if (bunnyVideoId || src) {
    return (
      <VideoModal
        bunnyLibraryId={bunnyLibraryId}
        bunnyVideoId={bunnyVideoId}
        src={src}
        title={title ?? 'Video'}
        triggerAriaLabel={title ? `Watch: ${title}` : undefined}
        triggerClassName={`${wrapperClass} focus:outline-none ${className}`}
      >
        {iconCircle}
        <span className={pillClass}>{label}</span>
      </VideoModal>
    );
  }

  return (
    <div className={`${wrapperClass} ${className}`}>
      {iconCircle}
      <span className={pillClass}>{label}</span>
    </div>
  );
}
