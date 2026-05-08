import type { Variants } from "framer-motion";

export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const welcomeTitle: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

export const welcomeSubtitle: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const welcomeButton: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const EASE_ELEGANT = [0.22, 1, 0.36, 1] as const;
export const ZOOM_DURATION = 0.8;
export const ZOOM_PADDING = 140;
