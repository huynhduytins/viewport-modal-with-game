import styles from "./GameConfig.module.css";

import {
  Button,
  Input,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Select,
  SelectValue,
  TextField,
} from "react-aria-components";
import { useTimer } from "../hooks";
import {
  ChangeEvent,
  Dispatch,
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import { GAME_STATUSES, TITLE } from "../constants";

interface GameConfigProps {
  isAutoPlay: boolean;
  gameStatus: GAME_STATUSES;
  isSmallViewPort?: boolean;
  setNumCircles: Dispatch<React.SetStateAction<number>>;
  setIsAutoPlay: Dispatch<React.SetStateAction<boolean>>;
  setNumRestartGame: Dispatch<React.SetStateAction<number>>;
  setGameStatus: Dispatch<React.SetStateAction<GAME_STATUSES>>;
}

const GameConfig = ({
  gameStatus,
  isAutoPlay,
  setIsAutoPlay,
  setGameStatus,
  isSmallViewPort,
  setNumRestartGame,
  setNumCircles,
}: GameConfigProps) => {
  const [point, setPoint] = useState(0);
  const [title, setTitle] = useState(TITLE.START);

  const [isLimitTime, setIsLimitTime] = useState(false);
  const { time, handleClick, handleRestart, handleStop } = useTimer({
    increase: true,
  });

  const timeoutRef = useRef<number | undefined>();
  const selectedLimitRef = useRef("unset");

  const handlePointChange = (e: ChangeEvent<HTMLInputElement>) => {
    // values that are not positive integers are not allowed
    const value = parseInt(e.target.value.replace(/[^\d]/, ""));

    if (isNaN(value)) {
      setPoint(0);
    } else if (value !== 0 && value <= 2000) {
      setPoint(value);
    } else if(value > 2000) {
      setPoint(2000);
    }
  };

  const handleSelectChange = (key: Key) => {
    setIsLimitTime(false);
    selectedLimitRef.current = key as string;
  };

  useEffect(() => {
    if (gameStatus === GAME_STATUSES.COMPLETED) {
      timeoutRef.current = setTimeout(() => {
        handleStop();
        setTitle(TITLE.COMPLETED);
      }, 3000);
    } else if (gameStatus === GAME_STATUSES.GAME_OVER) {
      handleStop();
      setTitle(TITLE.GAME_OVER);
    } else if (gameStatus === GAME_STATUSES.RESTART) {
      handleRestart(true);
      setTitle(TITLE.START);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  useEffect(() => {
    if (
      isLimitTime &&
      selectedLimitRef.current !== "unset" &&
      Number(selectedLimitRef.current) < Number(time)
    ) {
      clearInterval(timeoutRef.current);
      setGameStatus(GAME_STATUSES.GAME_OVER);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLimitTime, time]);

  return (
    <Fragment>
      <h2
        className={[
          styles.heading,
          title === TITLE.COMPLETED ? styles.headingCompleted : "",
          title === TITLE.GAME_OVER ? styles.headingGameOver : "",
        ].join(" ")}
      >
        {title}
      </h2>
      <div
        className={isSmallViewPort ? styles.smallViewPortGroup : styles.group}
      >
        <NumberField className={styles.field}>
          <Label>Point</Label>
          <Input
            className={styles.input}
            placeholder="Point"
            value={point}
            onChange={handlePointChange}
          />
        </NumberField>
        {!isAutoPlay ? (
          <Select
            className={styles.field}
            defaultSelectedKey="unset"
            onSelectionChange={handleSelectChange}
          >
            <Label>Limit time</Label>
            <Button className={styles.select}>
              <SelectValue />
              <span aria-hidden="true" className={styles.chevron}>
                ⌄
              </span>
            </Button>
            <Popover className={styles.popover}>
              <ListBox className={styles.listBox}>
                <ListBoxItem className={styles.item} id="unset">
                  unset
                </ListBoxItem>
                <ListBoxItem className={styles.item} id="10.0">
                  10.0s
                </ListBoxItem>
                <ListBoxItem className={styles.item} id="20.0">
                  20.0s
                </ListBoxItem>
                <ListBoxItem className={styles.item} id="50.0">
                  50.0s
                </ListBoxItem>
                <ListBoxItem className={styles.item} id="100.0">
                  100.0s
                </ListBoxItem>
                <ListBoxItem className={styles.item} id="200.0">
                  200.0s
                </ListBoxItem>
              </ListBox>
            </Popover>
          </Select>
        ) : null}
        <TextField className={styles.field}>
          <Label>Time</Label>
          <p>{time}s</p>
        </TextField>
      </div>
      <div className={styles.actions}>
        {gameStatus === GAME_STATUSES.NEW ? (
          <button
            className={styles.action}
            onClick={() => {
              handleClick();
              setNumCircles(point);
              setIsLimitTime(true);
              setGameStatus(GAME_STATUSES.STARTING);
            }}
          >
            Play
          </button>
        ) : (
          <Fragment>
            <button
              className={styles.action}
              onClick={() => {
                handleRestart();
                setIsAutoPlay(false);
                setIsLimitTime(true);
                setNumCircles(point);
                clearTimeout(timeoutRef?.current);
                setGameStatus(GAME_STATUSES.RESTART);
                setNumRestartGame((prev) => prev + 1);
              }}
            >
              Restart
            </button>
            {![TITLE.COMPLETED, TITLE.GAME_OVER].includes(title) ? (
              <button
                className={styles.action}
                onClick={() => {
                  selectedLimitRef.current = "unset";
                  setIsAutoPlay(isAutoPlay ? false : true);
                }}
              >
                Auto Play: {isAutoPlay ? "OFF" : "ON"}
              </button>
            ) : null}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default GameConfig;
