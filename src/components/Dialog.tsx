import { Fragment, useState } from "react";
import {
  DialogTriggerProps,
  Modal,
  ModalOverlay,
  Dialog as DialogContent,
  DialogTrigger,
} from "react-aria-components";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";

import styles from "./Dialog.module.css";
import { useResponsive } from "../hooks";
import { INERTIA_TRANSACTION, STATIC_TRANSITION } from "../constants";
import { ResponsiveInfo } from "../types";

const MotionModal = motion(Modal);
const MotionModalOverlay = motion(ModalOverlay);

const largeViewPortOverlayProps = {
  initial: {
    backgroundColor: "oklch(0% 0 0 / 0%)",
    backdropFilter: "blur(0px)",
  },
  animate: {
    backgroundColor: "oklch(0% 0 0 / 40%)",
    backdropFilter: "blur(10px)",
  },
  exit: {
    backgroundColor: "oklch(0% 0 0 / 0%)",
    backdropFilter: "blur(0px)",
  },
};

const largeViewPortModalProps: Parameters<typeof MotionModal>[0] = {
  initial: { opacity: 0, translateY: "-100%" },
  animate: { opacity: 1, translateY: "0%" },
  exit: { opacity: 0, translateY: "-100%" },
  transition: { type: "tween", duration: 0.3 },
};

type Props = Omit<DialogTriggerProps, "children"> & {
  target: (opts: {
    open: () => void;
    isSmallViewPort?: boolean;
  }) => React.ReactNode;
  children: (opts: {
    isSmallViewPort: boolean;
    responsivePoint: ResponsiveInfo;
  }) => React.ReactNode;
};

export const Dialog: React.FC<Props> = ({ children, target, ...props }) => {
  const [_isOpen, _setOpen] = useState(false);
  const isOpen = props?.isOpen || _isOpen;
  const setOpen = props?.onOpenChange || _setOpen;

  const responsive = useResponsive();
  const isSmallViewPort = !responsive.md;

  // Turn Dialog into Drawer on mobile viewport
  const h = window.innerHeight;
  const y = useMotionValue(h);

  const bgOpacity = useTransform(y, [0, h], [40, 0]);
  const bg = useMotionTemplate`oklch(0% 0 0 / ${bgOpacity}%)`;
  const backdropBlur = useTransform(y, [0, h], [10, 0]);
  const blur = useMotionTemplate`blur(${backdropBlur}px)`;

  const overlayProps: Parameters<typeof MotionModalOverlay>[0] = isSmallViewPort
    ? {
        style: {
          backgroundColor: bg as unknown as string,
          backdropFilter: blur as unknown as string,
        },
      }
    : largeViewPortOverlayProps;
  const modalProps: Parameters<typeof MotionModal>[0] = isSmallViewPort
    ? {
        initial: { y: h },
        animate: { y: 0 },
        exit: { y: h },
        transition: STATIC_TRANSITION,
        style: {
          y,
          top: 0,
        },
        drag: "y",
        dragElastic: 0.1,
        dragConstraints: { top: 0 },
        onDragEnd: (_, { offset, velocity }) => {
          if (offset.y > window.innerHeight * 0.75 || velocity.y > 10) {
            setOpen(false);
          } else {
            animate(y, 0, { ...INERTIA_TRANSACTION, min: 0, max: 0 });
          }
        },
      }
    : largeViewPortModalProps;

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setOpen} {...props}>
      {target({ open: () => setOpen(true), isSmallViewPort })}
      <AnimatePresence>
        {isOpen ? (
          <MotionModalOverlay
            isOpen
            onOpenChange={setOpen}
            className={[styles.overlay].join(" ")}
            {...overlayProps}
          >
            <MotionModal
              className={[styles.modal, isSmallViewPort && styles.mobile].join(
                " "
              )}
              {...modalProps}
            >
              {isSmallViewPort ? <div className={styles.affordance} /> : null}
              <DialogContent className={styles.dialog}>
                {({ close }) => (
                  <Fragment>
                    <button className={styles.close} onClick={close} />
                    {children({ isSmallViewPort, responsivePoint: responsive })}
                  </Fragment>
                )}
              </DialogContent>
            </MotionModal>
          </MotionModalOverlay>
        ) : null}
      </AnimatePresence>
    </DialogTrigger>
  );
};
