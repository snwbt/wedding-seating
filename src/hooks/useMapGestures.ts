import { useCallback } from "react";
import { useDrag, usePinch, useWheel } from "@use-gesture/react";
import type { MotionValue } from "framer-motion";
import { FULL_VIEW } from "./useFloorPlan";

const MIN_VIEW_SIZE = 200; // max zoom in: 200x200 viewBox
const WHEEL_ZOOM_FACTOR = 0.002; // sensitivity for scroll-wheel zoom
const PINCH_ZOOM_FACTOR = 0.01; // sensitivity for pinch zoom

interface UseMapGesturesOptions {
  motionValues: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    w: MotionValue<number>;
    h: MotionValue<number>;
  };
  svgRef: React.RefObject<SVGSVGElement | null>;
}

/** Clamp viewBox x/y so the floorplan can't be panned off-screen */
function clampPan(
  vx: number,
  vy: number,
  vw: number,
  vh: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(FULL_VIEW.width - vw, vx)),
    y: Math.max(0, Math.min(FULL_VIEW.height - vh, vy)),
  };
}

/** Clamp viewBox dimensions to min/max zoom */
function clampZoom(vw: number, vh: number): { w: number; h: number } {
  return {
    w: Math.max(MIN_VIEW_SIZE, Math.min(FULL_VIEW.width, vw)),
    h: Math.max(
      MIN_VIEW_SIZE * (FULL_VIEW.height / FULL_VIEW.width),
      Math.min(FULL_VIEW.height, vh),
    ),
  };
}

/**
 * Convert a screen-space point (relative to the SVG element) to SVG viewBox coordinates.
 */
function screenToSVG(
  screenX: number,
  screenY: number,
  svgEl: SVGSVGElement,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
): { sx: number; sy: number } {
  const rect = svgEl.getBoundingClientRect();
  const fracX = (screenX - rect.left) / rect.width;
  const fracY = (screenY - rect.top) / rect.height;
  return {
    sx: vx + fracX * vw,
    sy: vy + fracY * vh,
  };
}

export function useMapGestures({ motionValues, svgRef }: UseMapGesturesOptions) {
  const { x, y, w, h } = motionValues;

  // ─── Drag to pan ───
  const bindDrag = useDrag(
    ({ delta: [dx, dy], event }) => {
      event?.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const currentW = w.get();
      const currentH = h.get();

      // Convert screen pixels to viewBox units
      const scaleX = currentW / rect.width;
      const scaleY = currentH / rect.height;

      const newX = x.get() - dx * scaleX;
      const newY = y.get() - dy * scaleY;

      const clamped = clampPan(newX, newY, currentW, currentH);
      x.set(clamped.x);
      y.set(clamped.y);
    },
    {
      pointer: { touch: true },
      filterTaps: true,
    },
  );

  // ─── Pinch to zoom ───
  const bindPinch = usePinch(
    ({ origin: [ox, oy], delta: [dScale], event }) => {
      event?.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const currentW = w.get();
      const currentH = h.get();
      const currentX = x.get();
      const currentY = y.get();

      // Zoom factor from pinch delta
      const zoomDelta = -dScale * PINCH_ZOOM_FACTOR;
      const factor = 1 + zoomDelta;

      // Zoom toward the pinch center point
      const { sx, sy } = screenToSVG(ox, oy, svg, currentX, currentY, currentW, currentH);

      const newW = currentW * factor;
      const newH = currentH * factor;
      const clamped = clampZoom(newW, newH);

      // Adjust origin so the point under the pinch center stays fixed
      const newX = sx - (sx - currentX) * (clamped.w / currentW);
      const newY = sy - (sy - currentY) * (clamped.h / currentH);

      const clampedPan = clampPan(newX, newY, clamped.w, clamped.h);

      x.set(clampedPan.x);
      y.set(clampedPan.y);
      w.set(clamped.w);
      h.set(clamped.h);
    },
    {
      pointer: { touch: true },
    },
  );

  // ─── Scroll-wheel to zoom ───
  const bindWheel = useWheel(
    ({ delta: [, dy], event }) => {
      event?.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;

      const currentW = w.get();
      const currentH = h.get();
      const currentX = x.get();
      const currentY = y.get();

      // Zoom factor from wheel delta
      const factor = 1 + dy * WHEEL_ZOOM_FACTOR;

      // Zoom toward mouse cursor position
      const mouseEvent = event as WheelEvent;
      const { sx, sy } = screenToSVG(
        mouseEvent.clientX,
        mouseEvent.clientY,
        svg,
        currentX,
        currentY,
        currentW,
        currentH,
      );

      const newW = currentW * factor;
      const newH = currentH * factor;
      const clamped = clampZoom(newW, newH);

      const newX = sx - (sx - currentX) * (clamped.w / currentW);
      const newY = sy - (sy - currentY) * (clamped.h / currentH);
      const clampedPan = clampPan(newX, newY, clamped.w, clamped.h);

      x.set(clampedPan.x);
      y.set(clampedPan.y);
      w.set(clamped.w);
      h.set(clamped.h);
    },
    {
      eventOptions: { passive: false },
    },
  );

  /** Merge all gesture bindings for the SVG element */
  const bind = useCallback(() => {
    return {
      ...bindDrag(),
      ...bindPinch(),
      ...bindWheel(),
    };
  }, [bindDrag, bindPinch, bindWheel]);

  return { bind };
}
