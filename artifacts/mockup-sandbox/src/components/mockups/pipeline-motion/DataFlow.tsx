export function DataFlow() {
  const bits = Array.from({ length: 26 });
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden">
      <style>{`
        /* Pixel bits travelling left-to-right strictly INSIDE the glass tube */
        @keyframes tube-travel {
          0%   { left: 33%; opacity: 0; }
          12%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { left: 70%; opacity: 0; }
        }
        @keyframes bit-wobble {
          0%   { transform: translate(-50%,-50%) translateY(0) rotate(var(--rot)) scale(1); }
          50%  { transform: translate(-50%,-50%) translateY(-3px) rotate(var(--rot)) scale(1.12); }
          100% { transform: translate(-50%,-50%) translateY(0) rotate(var(--rot)) scale(1); }
        }
        .flow-wrap { position: relative; }
        .flow-img {
          border-radius: 18px;
          display: block;
          width: 100%;
          height: auto;
        }
        .lane {
          position: absolute;
          animation: tube-travel linear infinite;
          will-change: left, opacity;
        }
        .bit {
          display: block;
          border-radius: 2px;
          background: linear-gradient(135deg, #bfe0f5 0%, #6fb3e0 50%, #4d9fd6 100%);
          box-shadow: 0 0 6px 1px rgba(77,159,214,0.55);
          animation: bit-wobble ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
      <div className="flow-wrap w-[88%] max-w-[1520px]">
        <img
          src="/__mockup/images/production-pipeline-clean.webp"
          alt="Production Pipeline"
          className="flow-img"
        />
        {bits.map((_, i) => {
          const top = 31 + (i % 7) * 2.1;
          const size = 6 + (i % 4) * 1.4;
          const rot = ((i * 37) % 90) - 45;
          return (
            <span
              key={i}
              className="lane"
              style={{
                top: `${top}%`,
                animationDuration: `${(3.6 + (i % 5) * 0.35).toFixed(2)}s`,
                animationDelay: `${(i * 0.17).toFixed(2)}s`,
              }}
            >
              <span
                className="bit"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  // @ts-expect-error CSS custom property
                  "--rot": `${rot}deg`,
                  animationDuration: `${(1 + (i % 3) * 0.3).toFixed(2)}s`,
                }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}
