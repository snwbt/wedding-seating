import { useState, useCallback, useRef } from "react";
import { useMotionValue, animate } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { Table } from "../types";
import { createOffscreenPath } from "../lib/wayfinding";
import { FULL_VIEW } from "./useFloorPlan";
import { EASE_ELEGANT, ZOOM_DURATION } from "../lib/animations";

// ── Follow camera constants ──
const FOLLOW_W = 500;
const FOLLOW_H = Math.round(FOLLOW_W * (FULL_VIEW.height / FULL_VIEW.width)); // ~181
const ROUTE_DRAW_DURATION = 2.0; // seconds
const ROUTE_DRAW_DELAY = 300; // ms after initial pan

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface UseWayfindingOptions {
  table: Table | null;
  routePath: string | null;
  motionValues: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    w: MotionValue<number>;
    h: MotionValue<number>;
  };
  reducedMotion: boolean;
  zoomToTable: (table: Table, reducedMotion: boolean) => void;
}

export type WayfindingPhase = "idle" | "animating" | "complete";

export function useWayfinding({
  table,
  routePath,
  motionValues,
  reducedMotion,
  zoomToTable,
}: UseWayfindingOptions) {
  const progress = useMotionValue(0);
  const [phase, setPhase] = useState<WayfindingPhase>("idle");
  const [isRouteVisible, setIsRouteVisible] = useState(false);
  const [isCardReady, setIsCardReady] = useState(false);

  // Refs for cleanup
  const unsubRef = useRef<(() => void) | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cleanup = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startAnimation = useCallback(() => {
    if (!table || !routePath) return;
    cleanup();

    // ── Reduced motion: skip everything ──
    if (reducedMotion) {
      progress.set(1);
      setIsRouteVisible(true);
      setIsCardReady(true);
      setPhase("complete");
      zoomToTable(table, true);
      return;
    }

    // ── Full animation sequence ──
    setPhase("animating");
    setIsRouteVisible(true);
    setIsCardReady(false);
    progress.set(0);

    const offscreenPath = createOffscreenPath(routePath);
    const totalLength = offscreenPath.getTotalLength();

    // Phase 1: Pan to entrance area (0.6s)
    const { x, y, w, h } = motionValues;
    const entranceDur = 0.6;
    const entranceX = clamp(1665 - FOLLOW_W / 2, 0, FULL_VIEW.width - FOLLOW_W);
    const entranceY = clamp(605 - FOLLOW_H / 2, 0, FULL_VIEW.height - FOLLOW_H);

    animate(x, entranceX, { duration: entranceDur, ease: EASE_ELEGANT as never });
    animate(y, entranceY, { duration: entranceDur, ease: EASE_ELEGANT as never });
    animate(w, FOLLOW_W, { duration: entranceDur, ease: EASE_ELEGANT as never });
    animate(h, FOLLOW_H, { duration: entranceDur, ease: EASE_ELEGANT as never });

    // Phase 2+3: Route draw + viewBox follow (starts after delay)
    const drawTimer = setTimeout(() => {
      // Subscribe to progress to follow the marker
      const unsub = progress.on("change", (p) => {
        if (p >= 1) return;
        const pt = offscreenPath.getPointAtLength(p * totalLength);
        const tx = clamp(pt.x - FOLLOW_W / 2, 0, FULL_VIEW.width - FOLLOW_W);
        const ty = clamp(pt.y - FOLLOW_H / 2, 0, FULL_VIEW.height - FOLLOW_H);
        x.set(tx);
        y.set(ty);
        // w and h stay at FOLLOW_W/FOLLOW_H during follow
      });
      unsubRef.current = unsub;

      // Animate progress 0 → 1
      animate(progress, 1, {
        duration: ROUTE_DRAW_DURATION,
        ease: [0.4, 0, 0.2, 1], // easeInOut for natural walking
        onComplete: () => {
          // Phase 4: Zoom to table
          unsub();
          unsubRef.current = null;
          zoomToTable(table, false);

          // Phase 5: Show card partway through zoom
          const cardTimer = setTimeout(() => {
            setPhase("complete");
            setIsCardReady(true);
          }, (ZOOM_DURATION * 0.6) * 1000);
          timersRef.current.push(cardTimer);
        },
      });
    }, ROUTE_DRAW_DELAY);
    timersRef.current.push(drawTimer);
  }, [table, routePath, reducedMotion, motionValues, progress, zoomToTable, cleanup]);

  const resetAnimation = useCallback(() => {
    cleanup();
    progress.jump(0);
    setPhase("idle");
    setIsRouteVisible(false);
    setIsCardReady(false);
  }, [progress, cleanup]);

  return {
    progress,
    phase,
    isRouteVisible,
    isCardReady,
    startAnimation,
    resetAnimation,
  };
}
