import { useCallback } from "react";
import { animate } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { FULL_VIEW } from "../hooks/useFloorPlan";

interface Props {
  motionValues: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    w: MotionValue<number>;
    h: MotionValue<number>;
  };
  reducedMotion: boolean;
  onReset: () => void;
}

const MIN_ZOOM_SIZE = 200; // minimum viewBox dimension when zoomed in

export default function ZoomControls({ motionValues, reducedMotion, onReset }: Props) {
  const { x, y, w, h } = motionValues;

  const zoom = useCallback(
    (factor: number) => {
      const currentW = w.get();
      const currentH = h.get();
      const currentX = x.get();
      const currentY = y.get();

      const newW = Math.max(MIN_ZOOM_SIZE, Math.min(FULL_VIEW.width, currentW * factor));
      const newH = Math.max(MIN_ZOOM_SIZE, Math.min(FULL_VIEW.height, currentH * factor));

      // Zoom toward center of current view
      const centerX = currentX + currentW / 2;
      const centerY = currentY + currentH / 2;
      const newX = Math.max(0, Math.min(FULL_VIEW.width - newW, centerX - newW / 2));
      const newY = Math.max(0, Math.min(FULL_VIEW.height - newH, centerY - newH / 2));

      const duration = reducedMotion ? 0.01 : 0.3;

      animate(w, newW, { duration });
      animate(h, newH, { duration });
      animate(x, newX, { duration });
      animate(y, newY, { duration });
    },
    [x, y, w, h, reducedMotion],
  );

  const btnClass =
    "bg-bg-card/90 backdrop-blur-sm border border-card-border w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary shadow-soft hover:shadow-card transition-all cursor-pointer text-xl font-body";

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 safe-bottom safe-right">
      <button
        onClick={() => zoom(0.6)}
        className={`${btnClass} rounded-t-button rounded-b-sm`}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => zoom(1.6)}
        className={`${btnClass} rounded-sm`}
        aria-label="Zoom out"
      >
        &minus;
      </button>
      <button
        onClick={onReset}
        className={`${btnClass} rounded-t-sm rounded-b-button text-sm`}
        aria-label="Reset view"
        title="Reset to full venue"
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="12" height="12" rx="2" />
          <path d="M1 1l12 12M13 1L1 13" strokeOpacity="0.3" />
        </svg>
      </button>
    </div>
  );
}
