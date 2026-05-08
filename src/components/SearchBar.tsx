import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeScale, staggerContainer } from "../lib/animations";
import { useGuestSearch } from "../hooks/useGuestSearch";
import { useTranslation } from "../lib/i18n";
import SearchResultCard from "./SearchResultCard";
import type { Guest } from "../types";

interface Props {
  onSelectGuest: (guest: Guest) => void;
}

export default function SearchBar({ onSelectGuest }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useGuestSearch();
  const { t } = useTranslation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedQuery]);

  const results = search(debouncedQuery);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        onSelectGuest(results[activeIndex].item);
      } else if (e.key === "Escape") {
        setQuery("");
        inputRef.current?.blur();
      }
    },
    [activeIndex, results, onSelectGuest],
  );

  const showNoResults = debouncedQuery.length >= 2 && results.length === 0;

  return (
    <motion.div
      className="flex flex-col items-center justify-start min-h-dvh px-5 pt-16 sm:pt-24"
      variants={fadeScale}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <p className="font-accent text-text-secondary text-lg italic mb-2">
        {t("welcomeSubtext")}
      </p>
      <h2 className="font-display text-text-primary text-2xl sm:text-3xl font-semibold mb-8">
        {t("findYourSeat")}
      </h2>

      <div className="w-full max-w-md relative">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
            role="combobox"
            autoComplete="off"
            className="w-full bg-bg-card border border-card-border rounded-card pl-12 pr-5 py-4 font-body text-text-primary text-lg placeholder:text-text-muted/50 shadow-soft focus:ring-2 focus:ring-accent/30 focus:border-border-accent outline-none transition-shadow"
          />
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              id="search-results"
              role="listbox"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-bg-card border border-card-border rounded-card shadow-elevated overflow-hidden z-10"
            >
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                {results.map((result, index) => (
                  <SearchResultCard
                    key={result.item.id}
                    guest={result.item}
                    isActive={index === activeIndex}
                    onClick={() => onSelectGuest(result.item)}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showNoResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center px-4 py-6"
          >
            <p className="font-body text-text-secondary text-base mb-1">
              {t("noResults")}
            </p>
            <p className="font-body text-text-muted text-sm">
              {t("askUsher")}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
