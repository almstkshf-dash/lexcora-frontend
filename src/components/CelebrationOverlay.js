"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const colors = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function CelebrationOverlay() {
  const [bursts, setBursts] = useState([]);

  const createBurst = () => {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `burst-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const particleCount = 16;
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      id: `${id}-${i}`,
      x: randomBetween(25, 75),
      y: randomBetween(15, 35),
      size: randomBetween(6, 10),
      delay: randomBetween(0, 120),
      rotate: randomBetween(-40, 40),
      hue: colors[Math.floor(Math.random() * colors.length)],
      drift: randomBetween(-10, 10)
    }));
    setBursts((prev) => [...prev, { id, particles }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((burst) => burst.id !== id));
    }, 1200);
  };

  useEffect(() => {
    const unsub = toast.onChange((payload) => {
      if (payload.status === "added" && payload.toast?.type === "success") {
        createBurst();
      }
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const rendered = useMemo(
    () =>
      bursts.map((burst) =>
        burst.particles.map((p) => (
          <span
            key={p.id}
            className="celebration-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}ms`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.rotate}deg`,
              backgroundColor: p.hue
            }}
          />
        ))
      ),
    [bursts]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[11000] overflow-hidden">
      <style jsx>{`
        @keyframes celebrate-fall {
          0% {
            transform: translate(0, 0) rotate(var(--spin));
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--drift) * 1px), 140px)
              rotate(calc(var(--spin) * 2));
            opacity: 0;
          }
        }
        .celebration-particle {
          position: absolute;
          border-radius: 9999px;
          animation: celebrate-fall 950ms ease-out forwards;
          box-shadow: 0 0 0 1px color-mix(in oklch, currentColor 12%, transparent);
          will-change: transform, opacity;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
      `}</style>
      {rendered}
    </div>
  );
}
