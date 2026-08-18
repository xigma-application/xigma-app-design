import { RefObject } from 'react';

export const setHoverState = (
  canvas: HTMLCanvasElement,
  hoverRef: RefObject<string | null>,
  setClassName: (className: string | null) => void,
  className: string | null,
  cursor: string,
  nodeId: string | null,
): void => {
  setClassName(className);
  canvas.style.cursor = cursor;
  hoverRef.current = nodeId;
};
