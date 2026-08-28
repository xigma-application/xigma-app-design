import { MouseEvent as ReactMouseEvent, RefObject, useEffect, useState } from 'react';

// types
import { TResizeHandlerSettings } from './types';

// utils
import { clamp } from 'utils/math/clamp';
import { createCursorOverlay } from './utils/createCursorOverlay';
import { getResizeCursor } from './utils/getResizeCursor';
import { handleMouseDown } from './utils/handleMouseDown';

export type TUseResizeHandlerResult = {
  cursorX: string;
  cursorY: string;
  height: number;
  isPressingX: boolean;
  isPressingY: boolean;
  onMouseDownX: TFunc<[ReactMouseEvent<HTMLElement>, boolean]>;
  onMouseDownY: TFunc<[ReactMouseEvent<HTMLElement>, boolean]>;
  setHeight: TFunc<[number]>;
  setWidth: TFunc<[number]>;
  width: number;
};

export const useResizeHandler = (settings: TResizeHandlerSettings, ref: RefObject<HTMLElement | null>): TUseResizeHandlerResult => {
  const { initialHeight, initialWidth, isInitiallyInvertedX, isInitiallyInvertedY, maxHeight, maxWidth, minHeight, minWidth } = settings;
  const [height, setHeight] = useState(initialHeight);
  const [isInvertedX, setIsInvertedX] = useState(isInitiallyInvertedX);
  const [isPressingX, setIsPressingX] = useState(false);
  const [isPressingY, setIsPressingY] = useState(false);
  const [isInvertedY, setIsInvertedY] = useState(isInitiallyInvertedY);
  const [width, setWidth] = useState(initialWidth);
  const cursorX = getResizeCursor(width, minWidth, maxWidth, isInvertedX, 'x');
  const cursorY = getResizeCursor(height, minHeight, maxHeight, isInvertedY, 'y');

  const handleMouseDownX = (event: ReactMouseEvent<HTMLElement>, isInverted: boolean): void => {
    handleMouseDown(event, isInverted, setIsInvertedX, setIsPressingX);
  };

  const handleMouseDownY = (event: ReactMouseEvent<HTMLElement>, isInverted: boolean): void => {
    handleMouseDown(event, isInverted, setIsInvertedY, setIsPressingY);
  };

  const handleMouseMoveX = (event: MouseEvent): void => {
    if (isPressingX) {
      const { left, right } = ref.current?.getBoundingClientRect() || { left: 0, right: 0 };
      const position = isInvertedX ? Math.abs(event.clientX - right) : event.clientX - left;

      setWidth(clamp(position, minWidth, maxWidth));
    }
  };

  const handleMouseMoveY = (event: MouseEvent): void => {
    if (isPressingY) {
      const { top, bottom } = ref.current?.getBoundingClientRect() || { bottom: 0, top: 0 };
      const position = isInvertedY ? event.clientY - bottom : event.clientY - top;

      setHeight(clamp(position, minHeight, maxHeight));
    }
  };

  const handleMouseUp = (): void => {
    setIsPressingX(false);
    setIsPressingY(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMoveX);
    document.addEventListener('mousemove', handleMouseMoveY);
    document.addEventListener('mouseup', handleMouseUp);

    return (): void => {
      document.removeEventListener('mousemove', handleMouseMoveX);
      document.removeEventListener('mousemove', handleMouseMoveY);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [height, isInvertedX, isPressingX, isPressingY, isInvertedY, width]);

  useEffect(() => {
    if (isPressingX) {
      document.body.style.userSelect = 'none';
      const removeCursorOverlay = createCursorOverlay(cursorX);

      return (): void => {
        document.body.style.userSelect = 'initial';
        removeCursorOverlay();
      };
    }
  }, [cursorX, isPressingX]);

  useEffect(() => {
    if (isPressingY) {
      document.body.style.userSelect = 'none';
      const removeCursorOverlay = createCursorOverlay(cursorY);

      return (): void => {
        document.body.style.userSelect = 'initial';
        removeCursorOverlay();
      };
    }
  }, [cursorY, isPressingY]);

  return {
    cursorX,
    cursorY,
    height,
    isPressingX,
    isPressingY,
    onMouseDownX: handleMouseDownX,
    onMouseDownY: handleMouseDownY,
    setHeight,
    setWidth,
    width,
  };
};
