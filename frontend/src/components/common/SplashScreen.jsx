import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Show splash for a brief, professional duration (~1100ms), then begin smooth fade-out
    const timer = setTimeout(() => {
      setFading(true);
    }, 1100);

    // Unmount splash completely once fade-out completes
    const removeTimer = setTimeout(() => {
      setMounted(false);
      if (onFinish) onFinish();
    }, 1550);

    // Guaranteed safety timeout: splash will never remain stuck permanently
    const safetyTimer = setTimeout(() => {
      setMounted(false);
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
      clearTimeout(safetyTimer);
    };
  }, [onFinish]);

  if (!mounted) return null;

  return (
    <div
      className={`hamdi-splash-screen ${fading ? 'hamdi-splash-fade-out' : ''}`}
      role="status"
      aria-label="Loading HAMDI-Nutraceutical Pharmacy"
    >
      <div className="hamdi-splash-container">
        <div className="hamdi-splash-logo-box">
          <img
            src="/hamdi-nutraceutical-logo.png"
            alt="HAMDI-Nutraceutical Pharmacy Logo"
            className="hamdi-splash-logo"
            onError={() => setFading(true)}
          />
        </div>

        <h1 className="hamdi-splash-brand">
          HAMDI-<span>Nutraceutical</span> Pharmacy
        </h1>

        <p className="hamdi-splash-tagline">
          Trusted care, better health
        </p>

        <div className="hamdi-splash-loader-track" aria-hidden="true">
          <div className="hamdi-splash-loader-bar"></div>
        </div>
      </div>
    </div>
  );
}
