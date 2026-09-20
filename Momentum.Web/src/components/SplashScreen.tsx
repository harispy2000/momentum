import { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExiting(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${exiting ? 'splash-exit' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }}
    >
      {/* Ambient background glow — always screen-centered */}
      <div
        className="absolute"
        style={{
          width: 360,
          height: 360,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 70%)',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main content column */}
      <div className="relative flex flex-col items-center gap-6">

        {/* Logo wrapper — rings are centered inside THIS element */}
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>

          {/* Ring 1 — same center as logo */}
          <div
            className="splash-ring absolute inset-0 m-auto rounded-full border-2 border-indigo-400/50"
            style={{ width: 100, height: 100 }}
          />
          {/* Ring 2 — delayed */}
          <div
            className="splash-ring absolute inset-0 m-auto rounded-full border border-indigo-300/30"
            style={{ width: 100, height: 100, animationDelay: '0.45s' }}
          />
          {/* Ring 3 — more delayed */}
          <div
            className="splash-ring absolute inset-0 m-auto rounded-full border border-purple-300/20"
            style={{ width: 100, height: 100, animationDelay: '0.9s' }}
          />

          {/* Logo tile */}
          <div
            className="splash-logo relative flex items-center justify-center rounded-3xl shadow-2xl"
            style={{
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow:
                '0 0 60px 20px rgba(99,102,241,0.5), 0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            >
              M
            </span>
          </div>
        </div>

        {/* Wordmark */}
        <div className="splash-wordmark text-center">
          <p
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Momentum
          </p>
        </div>

        {/* Tagline */}
        <p
          className="splash-tagline"
          style={{
            fontSize: 12,
            color: 'rgba(167,139,250,0.8)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Your AI-powered productivity engine
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
