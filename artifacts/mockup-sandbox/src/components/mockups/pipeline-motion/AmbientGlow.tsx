export function AmbientGlow() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden">
      <style>{`
        @keyframes ambient-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-16px) scale(1.012); }
        }
        .ambient-img {
          animation: ambient-float 6s ease-in-out infinite;
          border-radius: 18px;
          will-change: transform;
        }
      `}</style>
      <img
        src="/__mockup/images/production-pipeline-clean.webp"
        alt="Production Pipeline"
        className="ambient-img w-[88%] max-w-[1520px] h-auto"
      />
    </div>
  );
}
