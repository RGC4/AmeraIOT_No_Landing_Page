export function ScrollReveal() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden">
      <style>{`
        @keyframes reveal-loop {
          0%   { opacity: 0; transform: translateY(70px) scale(0.98); filter: blur(8px); }
          18%  { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
          82%  { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
          100% { opacity: 0; transform: translateY(70px) scale(0.98); filter: blur(8px); }
        }
        .reveal-img {
          animation: reveal-loop 5s ease-in-out infinite;
          border-radius: 18px;
          will-change: transform, opacity, filter;
        }
      `}</style>
      <img
        src="/__mockup/images/production-pipeline-clean.webp"
        alt="Production Pipeline"
        className="reveal-img w-[88%] max-w-[1520px] h-auto"
      />
    </div>
  );
}
