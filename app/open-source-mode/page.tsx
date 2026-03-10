"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ProjectGallery from "./components/ProjectGallery";
import ContributionTimeline from "./components/ContributionTimeline";

// Dynamic import for 3D component
const Galaxy3D = dynamic(() => import("./components/Galaxy3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#050510] flex items-center justify-center">
      <div className="text-purple-400 text-xl animate-pulse">Loading Galaxy...</div>
    </div>
  ),
});

// Helper for client-side only rendering
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function OpenSourceModePage() {
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
  const galaxySectionRef = useRef<HTMLElement>(null);
  const [galaxyProgress, setGalaxyProgress] = useState(0);
  const router = useRouter();
  const previousThemeRef = useRef<string | null>(null);

  const { scrollYProgress: galaxyScrollProgress } = useScroll({
    target: galaxySectionRef,
    offset: ["start start", "end end"],
  });

  const drawProgress = useTransform(galaxyScrollProgress, [0, 1], [0, 1]);

  // Save previous theme and switch to dark mode on page enter
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    previousThemeRef.current = currentTheme;
    document.documentElement.setAttribute("data-theme", "dark");

    // Restore previous theme on page exit
    return () => {
      if (previousThemeRef.current) {
        document.documentElement.setAttribute("data-theme", previousThemeRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    if (previousThemeRef.current) {
      document.documentElement.setAttribute("data-theme", previousThemeRef.current);
    }
    router.push("/");
  };

  // Track scroll progress for galaxy animation
  useEffect(() => {
    const unsubscribe = drawProgress.on("change", (v: number) => setGalaxyProgress(v));
    return () => unsubscribe();
  }, [drawProgress]);

  return (
    <div className="bg-[#050510] min-h-screen">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-purple-500 rounded-full transition-all duration-300"
      >
        ← Back
      </button>

      {/* Section 1: 3D Galaxy */}
      <section ref={galaxySectionRef} className="relative h-[200vh]">
        {mounted && <Galaxy3D progress={galaxyProgress} />}

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: galaxyProgress > 0.8 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="sticky top-[70vh] flex justify-center pointer-events-none z-10"
        >
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-serif text-white tracking-widest">
              OPEN SOURCE
            </div>
            <div className="text-sm text-purple-400 tracking-[0.3em] mt-2">
              CODE IS ART
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: Project Gallery */}
      <ProjectGallery />

      {/* Section 3: Contribution Timeline */}
      <ContributionTimeline />

      {/* Footer */}
      <div className="py-20 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-purple-500/50" />
          <div className="text-sm text-gray-500">OPEN SOURCE MODE</div>
          <div className="w-12 h-px bg-purple-500/50" />
        </div>
      </div>
    </div>
  );
}
