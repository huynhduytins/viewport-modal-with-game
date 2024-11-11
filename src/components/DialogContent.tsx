import styles from "./DialogContent.module.css";

import { useMemo, useRef, useState } from "react";
import { GAME_STATUSES, RESPONSIVE_CONFIG } from "../constants";
import { ResponsiveConfig, ResponsiveInfo } from "../types";

import Circles from "./Circles";
import GameConfig from "./GameConfig";

export default function DialogContent({
  isSmallViewPort,
  responsivePoint,
  isResizing,
}: {
  isSmallViewPort: boolean;
  responsivePoint: ResponsiveInfo;
  isResizing: boolean;
}) {
  const [numCircles, setNumCircles] = useState(0);
  const [gameStatus, setGameStatus] = useState<GAME_STATUSES>(
    GAME_STATUSES.NEW
  );

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [numRestartGame, setNumRestartGame] = useState(0); // trigger re-render when click restart button more than twice in a row

  const boxRef = useRef<HTMLDivElement | null>(null);

  const boxWidth = useMemo(() => {
    const breakPoint = Object.values(responsivePoint).findIndex(
      (point) => !point
    );

    if (breakPoint === -1) return RESPONSIVE_CONFIG.xl;

    return RESPONSIVE_CONFIG[
      Object.keys(responsivePoint)[breakPoint - 1] as keyof ResponsiveConfig
    ];
  }, [responsivePoint]);

  return (
    <div
      className={[
        styles.content,
        !isSmallViewPort && styles.contentDesktop,
      ].join(" ")}
    >
      <GameConfig
        gameStatus={gameStatus}
        isAutoPlay={isAutoPlay}
        setIsAutoPlay={setIsAutoPlay}
        setGameStatus={setGameStatus}
        setNumCircles={setNumCircles}
        isSmallViewPort={isSmallViewPort}
        setNumRestartGame={setNumRestartGame}
      />
      <Circles
        boxRef={boxRef}
        boxWidth={boxWidth}
        numCircle={numCircles}
        isResizing={isResizing}
        gameStatus={gameStatus}
        isAutoPlay={isAutoPlay}
        setGameStatus={setGameStatus}
        numRestartGame={numRestartGame}
        responsivePoint={responsivePoint}
      />
    </div>
  );
}
