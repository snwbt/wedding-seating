import { motion } from "framer-motion";
import { staggerItem } from "../lib/animations";
import { useTranslation } from "../lib/i18n";
import type { Guest } from "../types";
import floorplanData from "../data/floorplan.json";

interface Props {
  guest: Guest;
  isActive: boolean;
  onClick: () => void;
}

export default function SearchResultCard({ guest, isActive, onClick }: Props) {
  const { t } = useTranslation();
  const table = floorplanData.tables.find((tbl) => tbl.id === guest.tableId);
  const tableLabel = table?.label ?? guest.tableId;

  return (
    <motion.button
      variants={staggerItem}
      onClick={onClick}
      className={`w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
        isActive
          ? "bg-accent-muted"
          : "hover:bg-bg-secondary"
      }`}
      role="option"
      aria-selected={isActive}
    >
      <div className="min-w-0">
        <p className="font-display text-text-primary text-lg font-medium truncate">
          {guest.firstName} {guest.lastName}
        </p>
        <p className="font-body text-text-muted text-sm truncate">
          {guest.relation}
        </p>
      </div>
      <span className="shrink-0 text-xs font-body font-medium text-text-accent bg-accent-muted px-3 py-1 rounded-badge tracking-wide">
        {t("table")} {tableLabel}
      </span>
    </motion.button>
  );
}
