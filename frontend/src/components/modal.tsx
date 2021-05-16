import type { ComponentChildren } from "preact";
import { createPortal, useMemo } from "preact/compat";
import { keyframes, style } from "typestyle";
import type { NestedCSSProperties } from "typestyle/lib/types";
import { Box } from "./box";
import { LoadingButton } from "./loading-button";

const openAnimation = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const MODAL_BUTTON_STYLE: NestedCSSProperties = {
  flex: 1,
  backgroundColor: "#eee",
  border: "1px solid #ddd",
  $nest: {
    "&:active": {
      backgroundColor: "#ddd",
    },
  },
};

export const MODAL_INPUT_STYLE: NestedCSSProperties = {
  backgroundColor: "#eee",
  border: "1px solid #ddd !important",
  $nest: {
    "&:active": {
      backgroundColor: "#ddd",
    },
  },
};

export function Modal({
  children,
  title,
  oneButton = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
}: {
  children?: ComponentChildren;
  title?: string;
  oneButton?: boolean;
  confirmText?: string;
  cancelText?: string;
  onCancel?(): Promise<void> | void;
  onConfirm?(): Promise<void> | void;
}) {
  const container = useMemo(() => document.getElementById("modal")!, []);

  return createPortal(
    <div
      className={style({
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        left: 0,
        top: 0,
        height: "100%",
        position: "fixed",
        width: "100%",
        zIndex: 100,
      })}
    >
      <Box
        direction="column"
        className={style({
          height: "100%",
          width: "100%",
          animationName: openAnimation,
          animationDuration: "50ms",
          animationIterationCount: 1,
          textAlign: "center",
        })}
      >
        <Box direction="column" />
        <Box
          direction="column"
          className={style({
            margin: "auto",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "16px",
            width: "min(300px, calc(100vw - 50px))",
          })}
          spacing="8px"
          grow={false}
        >
          {title === null ? null : (
            <h2 className={style({ margin: 0 })}>{title}</h2>
          )}
          {children}
          <Box direction="row" spacing="8px">
            {oneButton ? null : (
              <LoadingButton
                className={style(MODAL_BUTTON_STYLE)}
                onClick={async () => {
                  await onCancel?.();
                }}
              >
                {cancelText}
              </LoadingButton>
            )}
            <LoadingButton
              className={style(MODAL_BUTTON_STYLE)}
              onClick={async () => {
                await onConfirm?.();
              }}
            >
              {confirmText}
            </LoadingButton>
          </Box>
        </Box>
        <Box direction="column" />
      </Box>
    </div>,
    container
  );
}
