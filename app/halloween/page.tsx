"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PUMPKIN_POSITIONS = [
  { left: "10%", top: "25%", size: 80, delay: 0 },
  { left: "70%", top: "20%", size: 70, delay: 0.5 },
  { left: "40%", top: "55%", size: 90, delay: 1.0 },
  { left: "20%", top: "65%", size: 60, delay: 1.5 },
  { left: "75%", top: "50%", size: 75, delay: 2.0 },
];

const BAT_COUNT = 10;
const GHOST_FIRE_COUNT = 15;

function GhostFires() {
  const fires = Array.from({ length: GHOST_FIRE_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 8 + Math.random() * 8,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
    color: i % 3 === 0 ? "#00ccff" : "#00ff66",
  }));

  return (
    <>
      {fires.map((fire) => (
        <div
          key={fire.id}
          className="absolute rounded-full animate-ghost-fire"
          style={{
            left: fire.left,
            bottom: "5%",
            width: fire.size,
            height: fire.size,
            background: fire.color,
            boxShadow: `0 0 ${fire.size * 2}px ${fire.size}px ${fire.color}`,
            animationDuration: `${fire.duration}s`,
            animationDelay: `${fire.delay + 1}s`,
          }}
        />
      ))}
    </>
  );
}

function Bats() {
  const bats = Array.from({ length: BAT_COUNT }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 50,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 3,
    size: 20 + Math.random() * 20,
  }));

  return (
    <>
      {bats.map((bat) => (
        <div
          key={bat.id}
          className="absolute animate-bat-fly"
          style={{
            top: `${bat.top}%`,
            right: `-${bat.size + 20}px`,
            animationDuration: `${bat.duration}s`,
            animationDelay: `${bat.delay + 2}s`,
          }}
        >
          <svg
            width={bat.size}
            height={bat.size * 0.5}
            viewBox="0 0 50 25"
            fill="#1a1a2e"
          >
            <path d="M25 12 C25 12 20 0 10 2 C5 3 2 8 0 12 C5 10 10 12 15 15 C18 16 22 18 25 20 C28 18 32 16 35 15 C40 12 45 10 50 12 C48 8 45 3 40 2 C30 0 25 12 25 12Z" />
          </svg>
        </div>
      ))}
    </>
  );
}

function Pumpkin({
  left,
  top,
  size,
  delay,
}: {
  left: string;
  top: string;
  size: number;
  delay: number;
}) {
  return (
    <div
      className="absolute animate-pumpkin-fade"
      style={{
        left,
        top,
        animationDelay: `${delay + 1.5}s`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="animate-pumpkin-glow"
        style={{ animationDelay: `${delay + 2}s` }}
      >
        {/* Stem */}
        <rect x="44" y="5" width="12" height="15" rx="3" fill="#2d5a27" />

        {/* Pumpkin body */}
        <ellipse cx="50" cy="55" rx="40" ry="38" fill="#e8720c" />
        <ellipse cx="35" cy="55" rx="28" ry="35" fill="#d4620a" />
        <ellipse cx="65" cy="55" rx="28" ry="35" fill="#d4620a" />

        {/* Eyes */}
        <polygon
          points="30,45 38,35 42,48"
          fill="#ff9900"
          className="animate-pumpkin-flicker"
          style={{ animationDelay: `${delay + 2.5}s` }}
        />
        <polygon
          points="58,48 62,35 70,45"
          fill="#ff9900"
          className="animate-pumpkin-flicker"
          style={{ animationDelay: `${delay + 2.8}s` }}
        />

        {/* Mouth */}
        <polygon
          points="30,65 38,72 45,65 50,72 55,65 62,72 70,65"
          fill="#ff9900"
          className="animate-pumpkin-flicker"
          style={{ animationDelay: `${delay + 3}s` }}
        />
      </svg>
    </div>
  );
}

export default function HalloweenPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"show" | "fadeout">("show");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fadeout"), 7000);
    const navTimer = setTimeout(() => router.push("/chat"), 8000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-1000 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Purple fog */}
      <div
        className="absolute bottom-0 left-0 right-0 animate-fog-rise"
        style={{
          height: "100%",
          background:
            "linear-gradient(to top, rgba(128, 0, 128, 0.3) 0%, transparent 60%)",
        }}
      />

      {/* Ghost fires */}
      <GhostFires />

      {/* Pumpkins */}
      {PUMPKIN_POSITIONS.map((p, i) => (
        <Pumpkin key={i} {...p} />
      ))}

      {/* Bats */}
      <Bats />

      {/* Central text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-central-text">🎃</div>
        <div
          className="font-serif text-3xl text-orange-400 animate-central-text"
          style={{
            textShadow:
              "0 0 20px #ff6600, 0 0 40px #ff6600, 0 0 60px #ff6600",
            animationDelay: "0.5s",
          }}
        >
          Happy Halloween
        </div>
      </div>

      <style jsx>{`
        @keyframes fog-rise {
          0% {
            height: 0%;
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            height: 100%;
            opacity: 0.6;
          }
        }
        .animate-fog-rise {
          animation: fog-rise 6s ease-out 0.5s both;
        }

        @keyframes ghost-fire {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-60vh) translateX(20px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-90vh) translateX(-10px);
            opacity: 0;
          }
        }
        .animate-ghost-fire {
          animation: ghost-fire 5s ease-out both;
        }

        @keyframes pumpkin-fade {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pumpkin-fade {
          opacity: 0;
          animation: pumpkin-fade 1s ease-out both;
        }

        @keyframes pumpkin-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 10px #ff6600);
          }
          50% {
            filter: drop-shadow(0 0 25px #ff6600)
              drop-shadow(0 0 50px #ff6600);
          }
        }
        .animate-pumpkin-glow {
          animation: pumpkin-glow 2s ease-in-out infinite;
        }

        @keyframes pumpkin-flicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pumpkin-flicker {
          animation: pumpkin-flicker 0.5s ease-in-out infinite;
        }

        @keyframes bat-fly {
          0% {
            transform: translateX(0) scaleX(1);
          }
          25% {
            transform: translateX(-30vw) scaleX(-1) translateY(-10px);
          }
          50% {
            transform: translateX(-60vw) scaleX(1) translateY(5px);
          }
          75% {
            transform: translateX(-90vw) scaleX(-1) translateY(-8px);
          }
          100% {
            transform: translateX(-120vw) scaleX(1) translateY(0);
          }
        }
        .animate-bat-fly {
          animation: bat-fly 4s linear both;
        }

        @keyframes central-text {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-central-text {
          opacity: 0;
          animation: central-text 1s ease-out 4s both;
        }
      `}</style>
    </div>
  );
}
