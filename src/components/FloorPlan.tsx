import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeScale } from "../lib/animations";
import { useFloorPlan } from "../hooks/useFloorPlan";
import { useMapGestures } from "../hooks/useMapGestures";
import { useWayfinding } from "../hooks/useWayfinding";
import { buildRoutePath, buildFallbackText } from "../lib/wayfinding";
import FloorPlanTable from "./FloorPlanTable";
import WayfindingRoute from "./WayfindingRoute";
import TableCard from "./TableCard";
import ZoomControls from "./ZoomControls";
import floorplanData from "../data/floorplan.json";
import guests from "../data/guests.json";
import { useTranslation } from "../lib/i18n";
import type { Guest, Table, FloorPlanData } from "../types";

const data = floorplanData as FloorPlanData;
const allGuests = guests as Guest[];

interface Props {
  selectedGuest: Guest | null;
  reducedMotion: boolean;
  onBack: () => void;
}

export default function FloorPlan({ selectedGuest, reducedMotion, onBack }: Props) {
  const { t, language } = useTranslation();
  const { viewBox, zoomToTable, resetView, motionValues } = useFloorPlan();
  const [tappedTable, setTappedTable] = useState<Table | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Interactive map gestures (pinch/zoom/pan)
  const { bind: bindGestures } = useMapGestures({ motionValues, svgRef });

  const selectedTable = selectedGuest
    ? (data.tables.find((tbl) => tbl.id === selectedGuest.tableId) as Table | undefined)
    : null;

  // ── Wayfinding ──
  const routePath = useMemo(
    () => (selectedTable ? buildRoutePath(selectedTable) : null),
    [selectedTable],
  );

  const fallbackText = useMemo(
    () =>
      selectedGuest && selectedTable
        ? buildFallbackText(selectedGuest.firstName, selectedTable, data.tables as Table[], language)
        : "",
    [selectedGuest, selectedTable, language],
  );

  const {
    progress,
    isRouteVisible,
    isCardReady,
    startAnimation,
    resetAnimation,
  } = useWayfinding({
    table: selectedTable ?? null,
    routePath,
    motionValues,
    reducedMotion,
    zoomToTable,
  });

  // Trigger wayfinding animation when a table is selected
  useEffect(() => {
    if (selectedTable && routePath) {
      startAnimation();
    }
  }, [selectedTable, routePath, startAnimation]);

  // Dismiss table card on Escape
  useEffect(() => {
    if (!tappedTable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTappedTable(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [tappedTable]);

  const handleTableClick = useCallback(
    (table: Table) => {
      setTappedTable((prev) => (prev?.id === table.id ? null : table));
    },
    [],
  );

  // Convert SVG coordinates to screen position for the table card overlay
  const getTableScreenPos = useCallback(
    (table: Table): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = table.cx;
      pt.y = table.cy - table.rx - 20; // above the table
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const screenPt = pt.matrixTransform(ctm);
      const svgRect = svg.getBoundingClientRect();
      return {
        x: screenPt.x - svgRect.left,
        y: screenPt.y - svgRect.top,
      };
    },
    [],
  );

  const walkway = data.walkway;
  const entrance = data.entrance;

  return (
    <motion.div
      className="flex flex-col lg:flex-row min-h-dvh"
      variants={fadeScale}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floorplan SVG */}
      <div
        className="flex-1 relative"
        onClick={(e) => {
          // Dismiss table card when clicking outside a table
          if ((e.target as Element).closest("[data-table]") === null) {
            setTappedTable(null);
          }
        }}
      >
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-[70vh] md:h-[75vh] lg:h-[80vh]"
          role="img"
          aria-label="Banquet hall floor plan"
          style={{
            background: "var(--color-floor-bg)",
            touchAction: "none",
            cursor: "grab",
          }}
          {...bindGestures()}
        >
          <defs>
            <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feFlood floodColor="var(--color-accent)" floodOpacity="0.3" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ballroom outline */}
          <rect
            x="20"
            y="20"
            width="1760"
            height="610"
            rx="4"
            fill="none"
            stroke="var(--color-border-default)"
            strokeWidth="1"
            strokeDasharray="8 4"
            opacity="0.5"
          />

          {/* Bottom-wall door openings */}
          {[380, 660, 940, 1220].map((dx) => (
            <rect
              key={`door-${dx}`}
              x={dx}
              y={622}
              width={60}
              height={12}
              rx={2}
              fill="var(--color-floor-bg)"
              stroke="var(--color-border-default)"
              strokeWidth={0.8}
              opacity={0.6}
            />
          ))}

          {/* Left-panel enclosure: Rostrum / Wedding Cake / Champagne Fountain */}
          <rect
            x={55}
            y={140}
            width={120}
            height={360}
            rx={6}
            fill="none"
            stroke="var(--color-border-default)"
            strokeWidth={1}
            opacity={0.5}
          />

          {/* Decorations */}
          {data.decorations.map((dec, i) => (
            <g key={`${dec.type}-${i}`}>
              <rect
                x={dec.cx - dec.width / 2}
                y={dec.cy - dec.height / 2}
                width={dec.width}
                height={dec.height}
                rx={6}
                fill="var(--color-bg-secondary)"
                stroke="var(--color-border-default)"
                strokeWidth={0.8}
                strokeDasharray={dec.type === "danceFloor" ? "4 4" : undefined}
              />
              {/* Handle multi-line labels with tspan */}
              <text
                x={dec.cx}
                y={dec.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text-muted)"
                fontSize={12}
                fontFamily="var(--font-body)"
                letterSpacing="0.03em"
              >
                {dec.label.includes("\n") ? (
                  dec.label.split("\n").map((line, j) => (
                    <tspan
                      key={j}
                      x={dec.cx}
                      dy={j === 0 ? `-${(dec.label.split("\n").length - 1) * 6}px` : "13"}
                    >
                      {line}
                    </tspan>
                  ))
                ) : (
                  dec.label
                )}
              </text>
            </g>
          ))}

          {/* Wedding aisle corridor */}
          {walkway.path && (
            <g>
              <path
                d={walkway.path}
                fill="var(--color-bg-secondary)"
                stroke="var(--color-border-default)"
                strokeWidth={1.5}
                opacity={0.55}
              />
              <text
                x={walkway.labelPosition?.x ?? 900}
                y={walkway.labelPosition?.y ?? 335}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-text-muted)"
                fontSize={12}
                fontFamily="var(--font-body)"
                letterSpacing="0.1em"
                fontWeight="500"
              >
                {walkway.label}
              </text>
            </g>
          )}

          {/* Wayfinding route line + marker */}
          {routePath && isRouteVisible && (
            <WayfindingRoute
              routePath={routePath}
              progress={progress}
              reducedMotion={reducedMotion}
            />
          )}

          {/* Entrance */}
          <g>
            <rect
              x={entrance.cx - entrance.width / 2}
              y={entrance.cy - entrance.height / 2}
              width={entrance.width}
              height={entrance.height}
              rx={4}
              fill="var(--color-accent-muted)"
              stroke="var(--color-accent-light)"
              strokeWidth={1}
            />
            <text
              x={entrance.cx}
              y={entrance.cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--color-text-accent)"
              fontSize={11}
              fontFamily="var(--font-body)"
              fontWeight="500"
              letterSpacing="0.05em"
            >
              {entrance.label}
            </text>
            {/* Orientation helper */}
            <text
              x={entrance.cx}
              y={entrance.cy + 22}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize={11}
              fontFamily="var(--font-body)"
              fontStyle="italic"
              letterSpacing="0.02em"
            >
              {entrance.helperText}
            </text>
          </g>

          {/* Tables */}
          {data.tables.map((table) => (
            <FloorPlanTable
              key={table.id}
              table={table as Table}
              isHighlighted={selectedTable?.id === table.id}
              highlightedSeatNumber={
                selectedTable?.id === table.id ? selectedGuest?.seatNumber : undefined
              }
              guests={allGuests.filter((g) => g.tableId === table.id)}
              reducedMotion={reducedMotion}
              onClick={() => handleTableClick(table as Table)}
            />
          ))}
        </svg>

        {/* Back / Reset buttons — 44px min touch targets */}
        <div className="absolute top-4 left-4 flex gap-2 safe-top safe-left">
          <button
            onClick={() => { resetAnimation(); onBack(); }}
            className="bg-bg-card/90 backdrop-blur-sm border border-card-border rounded-button px-4 py-3 font-body text-sm text-text-secondary shadow-soft hover:shadow-card transition-shadow cursor-pointer"
            aria-label="Back to search"
          >
            <span className="mr-1.5">&larr;</span> {t("backToSearch")}
          </button>
          {selectedTable && (
            <button
              onClick={() => {
                resetAnimation();
                resetView(reducedMotion);
                setTappedTable(null);
              }}
              className="bg-bg-card/90 backdrop-blur-sm border border-card-border rounded-button px-4 py-3 font-body text-sm text-text-secondary shadow-soft hover:shadow-card transition-shadow cursor-pointer"
              aria-label="Show full venue"
            >
              {t("fullVenue")}
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <ZoomControls
          motionValues={motionValues}
          reducedMotion={reducedMotion}
          onReset={() => {
            resetView(reducedMotion);
            setTappedTable(null);
          }}
        />

        {/* Table card overlay */}
        {tappedTable && (
          <TableCard
            table={tappedTable}
            isSelectedGuestTable={selectedTable?.id === tappedTable.id}
            position={getTableScreenPos(tappedTable)}
            onDismiss={() => setTappedTable(null)}
          />
        )}
      </div>

      {/* Fallback text directions */}
      {selectedGuest && selectedTable && fallbackText && (
        <div className="px-5 py-3 text-center lg:hidden">
          <p className="font-body text-text-muted text-xs leading-relaxed max-w-md mx-auto">
            {fallbackText}
          </p>
        </div>
      )}

      {/* Result Card — mobile bottom sheet + desktop side panel */}
      {selectedGuest && selectedTable && isCardReady && (
        <>
          {/* ── Mobile: iOS-style bottom sheet overlay ── */}
          <motion.div
            className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-card rounded-t-2xl border-t border-card-border shadow-elevated safe-x"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Drag handle — 44px touch target */}
            <button
              className="w-full flex justify-center pt-3 pb-1 min-h-[44px] cursor-pointer"
              onClick={() => setSheetExpanded((v) => !v)}
              aria-label={sheetExpanded ? "Collapse details" : "Expand details"}
            >
              <span className="w-10 h-1 rounded-full bg-border-default block" />
            </button>

            {/* Peek content — always visible */}
            <div className="px-5 pb-3">
              <p className="font-accent text-text-muted text-sm italic mb-1 tracking-wide">
                {t("yourSeatAssignment")}
              </p>
              <h2 className="font-display text-text-primary text-xl font-semibold">
                {selectedGuest.firstName} {selectedGuest.lastName}
              </h2>
              <p className="font-body text-text-secondary text-xs mt-1.5 leading-relaxed">
                {t("wayfindingMessage", {
                  name: selectedGuest.firstName,
                  table: selectedTable.label,
                  seat: selectedGuest.seatNumber,
                })}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-bg-secondary rounded-card p-3 text-center">
                  <p className="font-body text-text-muted text-[11px] uppercase tracking-widest mb-0.5">
                    {t("table")}
                  </p>
                  <p className="font-display text-text-accent text-2xl font-bold">
                    {selectedTable.label}
                  </p>
                </div>
                <div className="bg-bg-secondary rounded-card p-3 text-center">
                  <p className="font-body text-text-muted text-[11px] uppercase tracking-widest mb-0.5">
                    {t("seat")}
                  </p>
                  <p className="font-display text-text-accent text-2xl font-bold">
                    {selectedGuest.seatNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {sheetExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 safe-bottom">
                    <div className="border-t border-border-subtle pt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-text-muted text-sm">{t("group")}:</span>
                        <span className="font-body text-text-primary text-sm">{selectedGuest.relation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-text-muted text-sm">{t("side")}:</span>
                        <span className="font-body text-text-primary text-sm capitalize">
                          {selectedGuest.side === "bride" ? t("brideSide") : t("groomSide")}
                        </span>
                      </div>
                      {selectedGuest.dietary && (
                        <div className="flex items-center gap-2">
                          <span className="font-body text-text-muted text-sm">{t("dietary")}:</span>
                          <span className="inline-block font-body text-xs text-sage bg-sage-light px-2.5 py-0.5 rounded-badge">
                            {selectedGuest.dietary}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle">
                      <p className="font-body text-text-muted text-[11px] uppercase tracking-widest mb-2">
                        {t("seatedWithYou")}
                      </p>
                      <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                        {allGuests
                          .filter((g) => g.tableId === selectedGuest.tableId && g.id !== selectedGuest.id)
                          .map((g) => (
                            <div key={g.id} className="flex items-center justify-between">
                              <span className="font-body text-text-primary text-sm">
                                {g.firstName} {g.lastName}
                              </span>
                              <span className="font-body text-text-muted text-xs">
                                {t("seat")} {g.seatNumber}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Safe area bottom padding when collapsed */}
            {!sheetExpanded && <div className="safe-bottom" />}
          </motion.div>

          {/* ── Desktop: Side panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block lg:w-96 bg-bg-card border-l border-card-border shadow-elevated p-8"
          >
            <p className="font-accent text-text-muted text-sm italic mb-1 tracking-wide">
              {t("yourSeatAssignment")}
            </p>
            <h2 className="font-display text-text-primary text-3xl font-semibold mb-2">
              {selectedGuest.firstName} {selectedGuest.lastName}
            </h2>
            <p className="font-body text-text-secondary text-sm mb-5 leading-relaxed">
              {t("wayfindingMessage", {
                name: selectedGuest.firstName,
                table: selectedTable.label,
                seat: selectedGuest.seatNumber,
              })}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-bg-secondary rounded-card p-4 text-center">
                <p className="font-body text-text-muted text-xs uppercase tracking-widest mb-1">
                  {t("table")}
                </p>
                <p className="font-display text-text-accent text-3xl font-bold">
                  {selectedTable.label}
                </p>
              </div>
              <div className="bg-bg-secondary rounded-card p-4 text-center">
                <p className="font-body text-text-muted text-xs uppercase tracking-widest mb-1">
                  {t("seat")}
                </p>
                <p className="font-display text-text-accent text-3xl font-bold">
                  {selectedGuest.seatNumber}
                </p>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-body text-text-muted text-sm">{t("group")}:</span>
                <span className="font-body text-text-primary text-sm">{selectedGuest.relation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-text-muted text-sm">{t("side")}:</span>
                <span className="font-body text-text-primary text-sm capitalize">
                  {selectedGuest.side === "bride" ? t("brideSide") : t("groomSide")}
                </span>
              </div>
              {selectedGuest.dietary && (
                <div className="flex items-center gap-2">
                  <span className="font-body text-text-muted text-sm">{t("dietary")}:</span>
                  <span className="inline-block font-body text-xs text-sage bg-sage-light px-2.5 py-0.5 rounded-badge">
                    {selectedGuest.dietary}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle">
              <p className="font-body text-text-muted text-xs uppercase tracking-widest mb-3">
                {t("seatedWithYou")}
              </p>
              <div className="space-y-2">
                {allGuests
                  .filter((g) => g.tableId === selectedGuest.tableId && g.id !== selectedGuest.id)
                  .map((g) => (
                    <div key={g.id} className="flex items-center justify-between">
                      <span className="font-body text-text-primary text-sm">
                        {g.firstName} {g.lastName}
                      </span>
                      <span className="font-body text-text-muted text-xs">
                        {t("seat")} {g.seatNumber}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Fallback directions */}
            {fallbackText && (
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <p className="font-body text-text-muted text-xs leading-relaxed">
                  {fallbackText}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
