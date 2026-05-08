import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import WelcomeScreen from "./components/WelcomeScreen";
import SearchBar from "./components/SearchBar";
import FloorPlan from "./components/FloorPlan";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { LanguageProvider, useTranslation } from "./lib/i18n";
import type { AppPhase, Guest } from "./types";

function AppInner() {
  const [phase, setPhase] = useState<AppPhase>("welcome");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const { isReduced, toggle: toggleMotion } = useReducedMotion();
  const { language, toggle: toggleLanguage } = useTranslation();

  const handleStart = useCallback(() => setPhase("search"), []);

  const handleSelectGuest = useCallback((guest: Guest) => {
    setSelectedGuest(guest);
    setPhase("floorplan");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedGuest(null);
    setPhase("search");
  }, []);

  return (
    <main className="relative">
      <AnimatePresence mode="wait">
        {phase === "welcome" && (
          <WelcomeScreen key="welcome" onStart={handleStart} />
        )}
        {phase === "search" && (
          <SearchBar key="search" onSelectGuest={handleSelectGuest} />
        )}
        {phase === "floorplan" && (
          <FloorPlan
            key="floorplan"
            selectedGuest={selectedGuest}
            reducedMotion={isReduced}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>

      {/* Top-right controls — 44px touch targets per iOS HIG */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2 safe-top safe-right">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="bg-bg-card/80 backdrop-blur-sm border border-card-border rounded-full px-3.5 h-11 flex items-center justify-center text-text-muted hover:text-text-primary shadow-soft transition-colors cursor-pointer font-body text-sm tracking-wide"
          aria-label={language === "en" ? "Switch to Chinese" : "Switch to English"}
          title={language === "en" ? "切换中文" : "Switch to English"}
        >
          {language === "en" ? "中文" : "EN"}
        </button>

        {/* Reduced motion toggle */}
        <button
          onClick={toggleMotion}
          className="bg-bg-card/80 backdrop-blur-sm border border-card-border rounded-full w-11 h-11 flex items-center justify-center text-text-muted hover:text-text-primary shadow-soft transition-colors cursor-pointer"
          aria-label={isReduced ? "Enable animations" : "Reduce animations"}
          title={isReduced ? "Enable animations" : "Reduce animations"}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isReduced ? (
              <path d="M2 8h12M8 2v12" strokeLinecap="round" />
            ) : (
              <path d="M2 8c1-3 3-5 6-5s5 2 6 5c-1 3-3 5-6 5s-5-2-6-5zM8 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
