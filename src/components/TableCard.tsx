import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import type { Table } from "../types";

interface Props {
  table: Table;
  isSelectedGuestTable: boolean;
  position: { x: number; y: number } | null;
  onDismiss: () => void;
}

export default function TableCard({ table, isSelectedGuestTable, position }: Props) {
  const { t } = useTranslation();
  if (!position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute z-20 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="bg-bg-card border border-card-border rounded-card shadow-elevated px-4 py-3 text-center min-w-[120px]">
        <p className="font-display text-text-primary text-base font-semibold">
          {t("table")} {table.label}
        </p>
        {isSelectedGuestTable && (
          <>
            <p className="font-body text-text-accent text-xs mt-1">
              {t("youAreSeatedHere")}
            </p>
            <p className="font-body text-text-muted text-xs mt-0.5">
              {t("seat")} 1&ndash;{table.seats.length}
            </p>
          </>
        )}
      </div>
      {/* Arrow pointing down to the table */}
      <div className="flex justify-center">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid var(--color-card-border)",
          }}
        />
      </div>
    </motion.div>
  );
}
