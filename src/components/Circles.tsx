import { Dispatch, MutableRefObject, useEffect, useRef, useState } from "react";
import styles from "./Circles.module.css";
import { GAME_STATUSES, RADIUS } from "../constants";
import { useTimer } from "../hooks";
import { motion } from "framer-motion";
import { CircleData, ResponsiveInfo } from "../types";

interface CircleProps {
  x: number;
  y: number;
  number: number;
  totalCircle: number;
  numberShouldClick: number;
  handleClickCorrectNumber: (num: number) => void;
  allTimersRef: MutableRefObject<(number | undefined)[]>;
  allCirclesRef: MutableRefObject<(HTMLDivElement | null)[]>;
}

const Circle = ({
  x,
  y,
  number,
  totalCircle,
  allTimersRef,
  allCirclesRef,
  numberShouldClick,
  handleClickCorrectNumber,
}: CircleProps) => {
  const circleRef = useRef<HTMLDivElement | null>(null);
  const [isCorrectNumClicked, setIsCorrectNumClicked] = useState(true);
  const { time, handleClick, timerRef } = useTimer({ increase: false });

  if (time === "0.0") {
    clearInterval(timerRef.current);
  }

  useEffect(() => {
    if (timerRef?.current) {
      allTimersRef.current.push(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRef?.current]);

  useEffect(() => {
    if (
      circleRef?.current &&
      !allCirclesRef.current.includes(circleRef.current)
    ) {
      allCirclesRef?.current.push(circleRef.current);
    }
  }, [allCirclesRef]);

  return (
    <div
      ref={circleRef}
      onClick={() => {
        if (numberShouldClick < number) {
          setIsCorrectNumClicked(false);
          handleClickCorrectNumber(number);
        } else if (numberShouldClick === number) {
          handleClick();
          handleClickCorrectNumber(number);
        }
      }}
      className={styles.circle}
      style={{
        position: "absolute",
        top: y - RADIUS,
        left: x - RADIUS,
        width: RADIUS * 2,
        height: RADIUS * 2,
        zIndex: totalCircle - number,
        opacity: isCorrectNumClicked ? Number(time) / 3 : 1,
        borderRadius: "50%",
        border: "1px solid var(--primary)",
        gap: 0,
        background: `${
          time === "3.0" && isCorrectNumClicked
            ? "var(--stone-100)"
            : "var(--primary)"
        }`,
        display: time === "0.0" ? "none" : "flex",
        flexDirection: "column",
        justifyContent: "center",
        pointerEvents: isCorrectNumClicked ? "unset" : "none",
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          lineHeight: "1",
          fontSize: "14px",
          overflow: "hidden",
        }}
      >
        {number}
      </p>
      <p
        style={{
          margin: 0,
          textAlign: "center",
          lineHeight: "1",
          color: "var(--stone-100)",
          display: `${time === "3.0" && isCorrectNumClicked ? "none" : ""}`,
          fontSize: "12px",
        }}
      >
        {isCorrectNumClicked ? time : "3.0"}
      </p>
    </div>
  );
};

interface CirclesProps {
  boxWidth: number;
  numCircle: number;
  isAutoPlay: boolean;
  numRestartGame: number;
  responsivePoint: ResponsiveInfo;
  boxRef: MutableRefObject<HTMLDivElement | null>;
  gameStatus: GAME_STATUSES;
  setGameStatus: Dispatch<React.SetStateAction<GAME_STATUSES>>;
}

const Circles = ({
  numCircle,
  boxRef,
  responsivePoint,
  boxWidth,
  gameStatus,
  setGameStatus,
  numRestartGame,
  isAutoPlay,
}: CirclesProps) => {
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [nextCircleShouldClick, setNextCircleShouldClick] = useState(0);
  const [resetKey, setResetKey] = useState(0); // Unique key for re-render circles when restart game

  const allTimersRef = useRef<Array<number | undefined>>([]);
  const allCirclesRef = useRef<Array<HTMLDivElement | null>>([]);
  const autoPlayIntervalRef = useRef<number | undefined>();

  useEffect(() => {
    if (!boxRef.current || gameStatus === GAME_STATUSES.NEW) return;

    if ([GAME_STATUSES.STARTING, GAME_STATUSES.RESTART].includes(gameStatus)) {
      allTimersRef.current = [];
      allCirclesRef.current = [];

      const widthBox = boxRef.current.clientWidth;
      const heightBox = boxRef.current.clientHeight;

      const circles = Array.from({ length: numCircle }).map(() => {
        let x = Math.random() * (widthBox - RADIUS);
        let y = Math.random() * (heightBox - RADIUS);

        if (x < RADIUS) {
          x += RADIUS - x;
        }
        if (y < RADIUS) {
          y += RADIUS - y;
        }

        return {
          x,
          y,
        };
      });
      setCircles(circles);
      setResetKey((prev) => prev + 1);
      setNextCircleShouldClick(circles.length ? 1 : 0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus, boxRef, numRestartGame]);

  useEffect(() => {
    if (isAutoPlay && allCirclesRef.current.length) {
      autoPlayIntervalRef.current = setInterval(() => {
        if (isAutoPlay && allCirclesRef?.current?.length) {
          allCirclesRef.current[0]?.click();
        } else {
          clearInterval(autoPlayIntervalRef?.current);
        }
      }, 1000);
    }

    return () => clearInterval(autoPlayIntervalRef?.current);
  }, [isAutoPlay]);

  useEffect(() => {
    if (gameStatus === GAME_STATUSES.GAME_OVER) {
      for (let i = allTimersRef.current.length - 1; i >= 0; i--) {
        clearInterval(allTimersRef.current[i]);
      }
    }
  }, [gameStatus]);

  const handleClickCorrectNumber = (num: number) => {
    if (num === nextCircleShouldClick) {
      if (nextCircleShouldClick < numCircle) {
        allCirclesRef.current.shift();
        setNextCircleShouldClick((prevNum) => prevNum + 1);
      } else {
        setGameStatus(GAME_STATUSES.COMPLETED);
      }
    } else if (num > nextCircleShouldClick) {
      clearInterval(autoPlayIntervalRef?.current);
      setGameStatus(GAME_STATUSES.GAME_OVER);
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        pointerEvents:
          gameStatus === GAME_STATUSES.GAME_OVER || isAutoPlay
            ? "none"
            : "unset",
      }}
    >
      <motion.div
        className={styles.boxContainer}
        ref={boxRef}
        style={{
          width: `${!responsivePoint.md ? "100%" : boxWidth - 48 + "px"}`,
        }}
        animate={{
          width: `${!responsivePoint.md ? "100%" : boxWidth - 48 + "px"}`,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {circles.map((circle, index) => (
          <Circle
            {...circle}
            key={`${resetKey}-${index}`}
            number={index + 1}
            totalCircle={numCircle}
            allTimersRef={allTimersRef}
            allCirclesRef={allCirclesRef}
            numberShouldClick={nextCircleShouldClick}
            handleClickCorrectNumber={handleClickCorrectNumber}
          />
        ))}
      </motion.div>
      <p
        style={{
          display: [
            GAME_STATUSES.COMPLETED,
            GAME_STATUSES.GAME_OVER,
            GAME_STATUSES.NEW,
          ].includes(gameStatus)
            ? "none"
            : "inline-block",
        }}
      >
        Next: {nextCircleShouldClick}
      </p>
    </div>
  );
};

export default Circles;
