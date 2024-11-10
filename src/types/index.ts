import { RESPONSIVE_CONFIG } from "../constants";

type Subscriber = () => void;
type ResponsiveConfig = typeof RESPONSIVE_CONFIG;
type ResponsiveBreakpoint = keyof ResponsiveConfig;
type ResponsiveInfo = Record<ResponsiveBreakpoint, boolean>;

interface GameStatus {
  type: "new" | "starting" | "restart" | "completed" | "gameOver";
}

interface CircleData {
  x: number;
  y: number;
}

export type {
  CircleData,
  GameStatus,
  Subscriber,
  ResponsiveInfo,
  ResponsiveConfig,
  ResponsiveBreakpoint,
};
