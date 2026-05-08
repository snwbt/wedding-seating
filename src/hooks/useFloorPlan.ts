import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useMotionValue, animate } from "framer-motion";
import type { Table } from "../types";
import { EASE_ELEGANT, ZOOM_DURATION, ZOOM_PADDING } from "../lib/animations";
import floorplanData from "../data/floorplan.json";

const FULL_VIEW = {
  x: 0,
  y: 0,
  width: floorplanData.viewBox.width,
  height: floorplanData.viewBox.height,
};

export { FULL_VIEW };

export function useFloorPlan() {
  const x = useMotionValue(FULL_VIEW.x);
  const y = useMotionValue(FULL_VIEW.y);
  const w = useMotionValue(FULL_VIEW.width);
  const h = useMotionValue(FULL_VIEW.height);
  const [viewBox, setViewBox] = useState(
    `${FULL_VIEW.x} ${FULL_VIEW.y} ${FULL_VIEW.width} ${FULL_VIEW.height}`,
  );
  const rafRef = useRef<number>(0);

  const syncViewBox = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setViewBox(`${x.get()} ${y.get()} ${w.get()} ${h.get()}`);
    });
  }, [x, y, w, h]);

  useEffect(() => {
    const unsubs = [
      x.on("change", syncViewBox),
      y.on("change", syncViewBox),
      w.on("change", syncViewBox),
      h.on("change", syncViewBox),
    ];
    return () => {
      unsubs.forEach((u) => u());
      cancelAnimationFrame(rafRef.current);
    };
  }, [x, y, w, h, syncViewBox]);

  const zoomToTable = useCallback(
    (table: Table, reducedMotion: boolean) => {
      const duration = reducedMotion ? 0.01 : ZOOM_DURATION;
      const ease = reducedMotion ? "linear" : EASE_ELEGANT;
      const targetWidth = ZOOM_PADDING * 2;
      const targetHeight = ZOOM_PADDING * 2;

      animate(x, table.cx - ZOOM_PADDING, { duration, ease: ease as never });
      animate(y, table.cy - ZOOM_PADDING, { duration, ease: ease as never });
      animate(w, targetWidth, { duration, ease: ease as never });
      animate(h, targetHeight, { duration, ease: ease as never });
    },
    [x, y, w, h],
  );

  const resetView = useCallback(
    (reducedMotion: boolean) => {
      const duration = reducedMotion ? 0.01 : ZOOM_DURATION;
      const ease = reducedMotion ? "linear" : EASE_ELEGANT;

      animate(x, FULL_VIEW.x, { duration, ease: ease as never });
      animate(y, FULL_VIEW.y, { duration, ease: ease as never });
      animate(w, FULL_VIEW.width, { duration, ease: ease as never });
      animate(h, FULL_VIEW.height, { duration, ease: ease as never });
    },
    [x, y, w, h],
  );

  const panToPoint = useCallback(
    (
      cx: number,
      cy: number,
      viewWidth: number,
      viewHeight: number,
      duration: number,
      ease: number[] = EASE_ELEGANT as unknown as number[],
    ) => {
      const targetX = Math.max(0, Math.min(FULL_VIEW.width - viewWidth, cx - viewWidth / 2));
      const targetY = Math.max(0, Math.min(FULL_VIEW.height - viewHeight, cy - viewHeight / 2));
      animate(x, targetX, { duration, ease: ease as never });
      animate(y, targetY, { duration, ease: ease as never });
      animate(w, viewWidth, { duration, ease: ease as never });
      animate(h, viewHeight, { duration, ease: ease as never });
    },
    [x, y, w, h],
  );

  /** Stable reference so downstream hooks don't re-render */
  const motionValues = useMemo(() => ({ x, y, w, h }), [x, y, w, h]);

  return { viewBox, zoomToTable, resetView, panToPoint, motionValues };
}
