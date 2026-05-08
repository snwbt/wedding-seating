import { useMemo, useCallback } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import guests from "../data/guests.json";
import type { Guest } from "../types";

const FUSE_OPTIONS: IFuseOptions<Guest> = {
  keys: [
    { name: "firstName", weight: 0.4 },
    { name: "lastName", weight: 0.4 },
    { name: "nickname", weight: 0.3 },
    { name: "relation", weight: 0.15 },
  ],
  threshold: 0.35,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  shouldSort: true,
};

export function useGuestSearch() {
  const fuse = useMemo(() => new Fuse(guests as Guest[], FUSE_OPTIONS), []);

  const search = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) return [];
      return fuse.search(trimmed, { limit: 8 });
    },
    [fuse],
  );

  return search;
}
