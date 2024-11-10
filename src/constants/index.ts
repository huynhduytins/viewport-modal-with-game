import { ValueAnimationTransition } from "framer-motion";
import { Subscriber } from "../types";

const STATIC_TRANSITION = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1],
};

const INERTIA_TRANSACTION: ValueAnimationTransition<number> = {
  type: "inertia",
  bounceStiffness: 300,
  bounceDamping: 40,
  timeConstant: 300,
};

const RESPONSIVE_CONFIG = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

const IS_BROWSER = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const TITLE = {
  START: "Let's Play",
  COMPLETED: "All Cleared",
  GAME_OVER: "Game Over",
};

const SUBSCRIBERS = new Set<Subscriber>();

const RADIUS = 25;

enum GAME_STATUSES {
  NEW = "new",
  RESTART = "restart",
  STARTING = "starting",
  GAME_OVER = "gameOver",
  COMPLETED = "completed",
}

export {
  TITLE,
  RADIUS,
  IS_BROWSER,
  SUBSCRIBERS,
  GAME_STATUSES,
  RESPONSIVE_CONFIG,
  STATIC_TRANSITION,
  INERTIA_TRANSACTION,
};
