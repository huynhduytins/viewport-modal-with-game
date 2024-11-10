import styles from "./DialogContent.module.css";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { GAME_STATUSES, RESPONSIVE_CONFIG } from "../constants";
import { ResponsiveConfig, ResponsiveInfo } from "../types";

import Circles from "./Circles";
import GameConfig from "./GameConfig";

export default function DialogContent({
  isSmallViewPort,
  responsivePoint,
}: {
  isSmallViewPort: boolean;
  responsivePoint: ResponsiveInfo;
}) {
  const [point, setPoint] = useState(0);
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

  const handlePointChange = (e: ChangeEvent<HTMLInputElement>) => {
    // values that are not positive integers are not allowed
    const value = parseInt(e.target.value.replace(/[^\d]/, ""));

    if (isNaN(value)) {
      setPoint(0);
    } else if (value !== 0) {
      setPoint(value);
    }
  };

  return (
    <div
      className={[
        styles.content,
        !isSmallViewPort && styles.contentDesktop,
      ].join(" ")}
    >
      <GameConfig
        point={point}
        gameStatus={gameStatus}
        isAutoPlay={isAutoPlay}
        setIsAutoPlay={setIsAutoPlay}
        setGameStatus={setGameStatus}
        isSmallViewPort={isSmallViewPort}
        setNumRestartGame={setNumRestartGame}
        handlePointChange={handlePointChange}
      />
      <Circles
        boxRef={boxRef}
        numCircle={point}
        boxWidth={boxWidth}
        gameStatus={gameStatus}
        isAutoPlay={isAutoPlay}
        setGameStatus={setGameStatus}
        numRestartGame={numRestartGame}
        responsivePoint={responsivePoint}
      />
    </div>
  );
}
