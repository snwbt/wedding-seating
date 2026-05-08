import { motion } from "framer-motion";
import type { Table, Guest } from "../types";
import FloorPlanSeat from "./FloorPlanSeat";

interface Props {
  table: Table;
  isHighlighted: boolean;
  highlightedSeatNumber?: number;
  guests: Guest[];
  reducedMotion: boolean;
  onClick: () => void;
}

export default function FloorPlanTable({
  table,
  isHighlighted,
  highlightedSeatNumber,
  guests,
  reducedMotion,
  onClick,
}: Props) {
  const highlightFilter = isHighlighted
    ? "url(#glow-filter)"
    : undefined;

  return (
    <g
      data-table={table.id}
      role="button"
      tabIndex={0}
      aria-label={`Table ${table.label}, ${guests.length} guests seated`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ cursor: "pointer" }}
    >
      {table.shape === "round" ? (
        <motion.circle
          cx={table.cx}
          cy={table.cy}
          r={table.rx}
          fill="var(--color-table-surface)"
          stroke={isHighlighted ? "var(--color-accent)" : "var(--color-table-border)"}
          strokeWidth={isHighlighted ? 2.5 : 1.2}
          filter={highlightFilter}
          animate={
            isHighlighted && !reducedMotion
              ? { strokeOpacity: [1, 0.6, 1] }
              : {}
          }
          transition={
            isHighlighted && !reducedMotion
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
      ) : (
        <motion.rect
          x={table.cx - table.rx}
          y={table.cy - (table.ry ?? 40)}
          width={table.rx * 2}
          height={(table.ry ?? 40) * 2}
          rx={8}
          fill="var(--color-table-surface)"
          stroke={isHighlighted ? "var(--color-accent)" : "var(--color-table-border)"}
          strokeWidth={isHighlighted ? 2.5 : 1.2}
          filter={highlightFilter}
          animate={
            isHighlighted && !reducedMotion
              ? { strokeOpacity: [1, 0.6, 1] }
              : {}
          }
          transition={
            isHighlighted && !reducedMotion
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        />
      )}

      <text
        x={table.cx}
        y={table.cy + 5}
        textAnchor="middle"
        fill={isHighlighted ? "var(--color-accent)" : "var(--color-text-secondary)"}
        fontSize={14}
        fontFamily="var(--font-body)"
        fontWeight={isHighlighted ? 600 : 400}
      >
        {table.label}
      </text>

      {table.seats.map((seat) => {
        const guestAtSeat = guests.find(
          (g) => g.tableId === table.id && g.seatNumber === seat.seatNumber,
        );
        return (
          <FloorPlanSeat
            key={seat.seatNumber}
            seat={seat}
            tableCx={table.cx}
            tableCy={table.cy}
            isHighlighted={
              isHighlighted && seat.seatNumber === highlightedSeatNumber
            }
            guestName={
              guestAtSeat
                ? `${guestAtSeat.firstName} ${guestAtSeat.lastName}`
                : undefined
            }
            reducedMotion={reducedMotion}
          />
        );
      })}
    </g>
  );
}
