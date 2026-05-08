export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableId: string;
  seatNumber: number;
  side: "bride" | "groom";
  relation: string;
  dietary?: string;
  nickname?: string;
}

export interface Seat {
  seatNumber: number;
  angle: number;
  radius: number;
}

export interface Table {
  id: string;
  label: string;
  shape: "round" | "rect";
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  seats: Seat[];
  isHeadTable?: boolean;
}

export interface Decoration {
  type: "stage" | "danceFloor" | "entrance" | "bar" | "storage";
  label: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

export interface WalkwayPoint {
  x: number;
  y: number;
}

export interface Walkway {
  points: WalkwayPoint[];
  label: string;
  path?: string;
  labelPosition?: { x: number; y: number };
}

export interface Entrance {
  cx: number;
  cy: number;
  width: number;
  height: number;
  label: string;
  helperText: string;
}

export interface FloorPlanData {
  viewBox: { width: number; height: number };
  tables: Table[];
  decorations: Decoration[];
  walkway: Walkway;
  entrance: Entrance;
}

export type AppPhase = "welcome" | "search" | "floorplan";
