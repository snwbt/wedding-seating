import type { Table } from "../types";
import type { Language } from "./i18n";

// ── Corridor centerline constants ──
const ENTRANCE_START = { x: 1665, y: 605 };
const CORRIDOR_TURN = { x: 1665, y: 380 };
const AISLE_Y = 335;
const ARC_RADIUS = 45;
const AISLE_JOIN_X = 1620; // where arc meets horizontal aisle

/**
 * Build an SVG path string from the entrance to a table,
 * following the aisle corridor centerline.
 */
export function buildRoutePath(table: Table): string {
  const parts: string[] = [
    `M ${ENTRANCE_START.x},${ENTRANCE_START.y}`,
    `L ${CORRIDOR_TURN.x},${CORRIDOR_TURN.y}`,
    `A ${ARC_RADIUS},${ARC_RADIUS} 0 0,0 ${AISLE_JOIN_X},${AISLE_Y}`,
    `L ${table.cx},${AISLE_Y}`,
    `L ${table.cx},${table.cy}`,
  ];
  return parts.join(" ");
}

/**
 * Create an offscreen SVG path element for getPointAtLength / getTotalLength.
 * Works in all modern browsers even when not in the DOM.
 */
export function createOffscreenPath(d: string): SVGPathElement {
  const ns = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", d);
  return path;
}

/**
 * Determine which tables the guest walks past and the turn direction.
 */
function getTablesAlongRoute(
  targetTable: Table,
  allTables: Table[],
): { passedLabels: string[]; turnDirection: "right" | "left" } {
  const isTopRow = targetTable.cy < AISLE_Y;
  const sameRowTables = allTables
    .filter((t) => (isTopRow ? t.cy < AISLE_Y : t.cy > AISLE_Y))
    .sort((a, b) => b.cx - a.cx); // right-to-left (walking direction)

  const passedLabels: string[] = [];
  for (const t of sameRowTables) {
    if (t.cx > targetTable.cx && t.cx <= AISLE_JOIN_X) {
      passedLabels.push(t.label);
    }
  }

  // Walking left along aisle: top row is right, bottom row is left
  const turnDirection = isTopRow ? "right" : "left";
  return { passedLabels, turnDirection };
}

/**
 * Generate human-readable fallback directions.
 */
export function buildFallbackText(
  name: string,
  table: Table,
  allTables: Table[],
  language: Language,
): string {
  const { passedLabels, turnDirection } = getTablesAlongRoute(table, allTables);

  if (language === "zh") {
    if (passedLabels.length === 0) {
      const dir = turnDirection === "right" ? "右" : "左";
      return `${name}，从大门进入，你的桌子就在${dir}边 — 桌${table.label}。`;
    }
    const range =
      passedLabels.length === 1
        ? `桌${passedLabels[0]}`
        : `桌${passedLabels[0]}至桌${passedLabels[passedLabels.length - 1]}`;
    const dir = turnDirection === "right" ? "右转" : "左转";
    return `${name}，从大门进入，直走经过${range}，然后${dir}到桌${table.label}。`;
  }

  // English
  if (passedLabels.length === 0) {
    return `${name}, enter from the main doors — your table is immediately to your ${turnDirection} (Table ${table.label}).`;
  }
  const range =
    passedLabels.length === 1
      ? `Table ${passedLabels[0]}`
      : `Tables ${passedLabels[0]}–${passedLabels[passedLabels.length - 1]}`;
  return `${name}, enter from the main doors, walk straight past ${range}, then turn ${turnDirection} toward Table ${table.label}.`;
}
