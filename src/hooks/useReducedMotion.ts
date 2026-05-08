import { useReducedMotion as useFramerReducedMotion } from "framer-motion";
import { useState, useCallback } from "react";

export function useReducedMotion() {
  const prefersReduced = useFramerReducedMotion();
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  const isReduced = manualOverride !== null ? manualOverride : !!prefersReduced;

  const toggle = useCallback(() => {
    setManualOverride((prev) => !(prev ?? prefersReduced));
  }, [prefersReduced]);

  return { isReduced, toggle };
}
