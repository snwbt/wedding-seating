import { motion } from "framer-motion";
import type { Seat } from "../types";

interface Props {
  seat: Seat;
  tableCx: number;
  tableCy: number;
  isHighlighted: boolean;
  guestName?: string;
  reducedMotion: boolean;
}

export default function FloorPlanSeat({
  seat,
  tableCx,
  tableCy,
  isHighlighted,
  guestName,
  reducedMotion,
}: Props) {
  const rad = (seat.angle * Math.PI) / 180;
  const cx = tableCx + seat.radius * Math.cos(rad);
  const cy = tableCy + seat.radius * Math.sin(rad);

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={isHighlighted ? 10 : 8}
      fill={isHighlighted ? "var(--color-seat-highlight)" : "var(--color-seat-default)"}
      stroke={isHighlighted ? "var(--color-accent)" : "none"}
      strokeWidth={isHighlighted ? 2 : 0}
      animate={
        isHighlighted && !reducedMotion
          ? {
              r: [10, 13, 10],
              opacity: [1, 0.8, 1],
            }
          : {}
      }
      transition={
        isHighlighted && !reducedMotion
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <title>
        Seat {seat.seatNumber}
        {guestName ? `: ${guestName}` : ""}
      </title>
    </motion.circle>
  );
}
