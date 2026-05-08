import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";

interface Props {
  routePath: string;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}

export default function WayfindingRoute({ routePath, progress, reducedMotion }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const [totalLength, setTotalLength] = useState(0);

  const markerX = useMotionValue(0);
  const markerY = useMotionValue(0);
  const dashOffset = useMotionValue(0);

  // Measure path and set initial dashoffset
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    setTotalLength(len);

    if (reducedMotion) {
      // Show full path immediately
      dashOffset.set(0);
      const endPt = el.getPointAtLength(len);
      markerX.set(endPt.x);
      markerY.set(endPt.y);
    } else {
      dashOffset.set(len);
      const startPt = el.getPointAtLength(0);
      markerX.set(startPt.x);
      markerY.set(startPt.y);
    }
  }, [routePath, reducedMotion, dashOffset, markerX, markerY]);

  // Subscribe to progress for line reveal + marker position
  useEffect(() => {
    if (reducedMotion || totalLength === 0) return;
    const el = pathRef.current;
    if (!el) return;

    const unsub = progress.on("change", (p) => {
      const distance = p * totalLength;
      dashOffset.set(totalLength - distance);
      const pt = el.getPointAtLength(distance);
      markerX.set(pt.x);
      markerY.set(pt.y);
    });
    return unsub;
  }, [progress, totalLength, reducedMotion, dashOffset, markerX, markerY]);

  return (
    <g aria-hidden="true">
      {/* Route line */}
      <motion.path
        ref={pathRef}
        d={routePath}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength || undefined}
        style={{ strokeDashoffset: reducedMotion ? 0 : dashOffset }}
        opacity={0.8}
      />

      {/* Faint glow behind route */}
      <path
        d={routePath}
        fill="none"
        stroke="var(--color-accent-glow)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength || undefined}
        style={{
          strokeDashoffset: reducedMotion
            ? 0
            : (dashOffset as unknown as number),
        }}
        opacity={0.3}
      />

      {/* Moving marker */}
      <motion.g style={{ x: markerX, y: markerY }}>
        {/* Inner dot */}
        <circle
          r={7}
          fill="var(--color-accent)"
          stroke="white"
          strokeWidth={2.5}
        />
        {/* Pulsing outer ring */}
        {!reducedMotion && (
          <motion.circle
            r={10}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            animate={{ r: [10, 18, 10], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.g>
    </g>
  );
}
