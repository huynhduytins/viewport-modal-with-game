import { useCallback, useEffect, useRef, useState } from "react";
import { CircleData, ResponsiveBreakpoint, ResponsiveInfo } from "../types";
import {
  IS_BROWSER,
  RESIZE_DEBOUNCE_MS,
  RESPONSIVE_CONFIG,
  SUBSCRIBERS,
} from "../constants";

let listening = false;
let info: ResponsiveInfo;
let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

function handleResize() {
  const oldInfo = info;
  calculate();
  if (oldInfo === info) return;
  for (const subscriber of SUBSCRIBERS) {
    subscriber();
  }
}

function calculate() {
  const width = window.innerWidth;
  const newInfo = {} as ResponsiveInfo;
  let shouldUpdate = false;
  for (const _key of Object.keys(RESPONSIVE_CONFIG)) {
    const key = _key as ResponsiveBreakpoint;
    newInfo[key] = width >= RESPONSIVE_CONFIG[key];
    if (newInfo[key] !== info[key]) {
      shouldUpdate = true;
    }
  }
  if (shouldUpdate) {
    info = newInfo;
  }
}

function useResponsive() {
  if (IS_BROWSER && !listening) {
    info = {} as ResponsiveInfo;
    calculate();
    window.addEventListener("resize", () => {
      setIsResizing(true);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleResize();
        setIsResizing(false);
      }, RESIZE_DEBOUNCE_MS);
      handleResize();
    });
    listening = true;
  }

  const [state, setState] = useState<ResponsiveInfo>(info);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!IS_BROWSER) return;

    // In React 18's StrictMode, useEffect executes twice so the cleanup will be run the first time
    if (!listening) {
      window.addEventListener("resize", handleResize);
    }

    const subscriber = () => {
      setState(info);
    };

    SUBSCRIBERS.add(subscriber);
    return () => {
      SUBSCRIBERS.delete(subscriber);
      if (SUBSCRIBERS.size === 0) {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        window.removeEventListener("resize", handleResize);
        listening = false;
      }
    };
  }, []);

  return { state, isResizing };
}

function useTimer({ increase }: { increase?: boolean }) {
  const [time, setTime] = useState<string>(increase ? "0.0" : "3.0");
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | undefined>();

  const handleClick = () => {
    setIsRunning(true);
  };

  const handleRestart = (isRerun?: boolean) => {
    setTime(increase ? "0.0" : "3.0");
    if (isRerun) {
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) =>
          increase
            ? (Number(prevTime) + 0.1).toFixed(1)
            : (Number(prevTime) - 0.1).toFixed(1)
        );
      }, 100);
    }

    return () => (timerRef.current = undefined);
  }, [isRunning, increase]);

  return { time, handleClick, timerRef, handleRestart, handleStop };
}

function useGameCircles(
  radius: number,
  numCircle: number,
  boxRef: React.RefObject<HTMLDivElement>
) {
  const [circles, setCircles] = useState<CircleData[]>([]);
  const [nextCircleToClick, setNextCircleToClick] = useState(0);

  const generateCircles = useCallback(() => {
    if (!boxRef.current) return;

    const widthBox = boxRef.current.clientWidth;
    const heightBox = boxRef.current.clientHeight;

    const newCircles = Array.from({ length: numCircle }).map((_, index) => {
      const x = Math.max(
        radius,
        Math.min(widthBox - radius, Math.random() * widthBox)
      );
      const y = Math.max(
        radius,
        Math.min(heightBox - radius, Math.random() * heightBox)
      );

      return {
        x,
        y,
        number: index + 1,
      };
    });

    setCircles(newCircles);
    setNextCircleToClick(newCircles.length ? 1 : 0);
  }, [numCircle, boxRef, radius]);

  return {
    circles,
    nextCircleToClick,
    setNextCircleToClick,
    generateCircles,
  };
}

export { useResponsive, useGameCircles, useTimer };
