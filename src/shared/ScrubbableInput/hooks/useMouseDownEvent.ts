import { MouseEvent, RefObject } from 'react';

export type TUseMouseDownEvent = TFunc<[MouseEvent]>;

export const useMouseDownEvent = (
  inputRef: RefObject<HTMLDivElement | null>,
  onMouseDown: TFunc,
  setMousePosition: TFunc<[T2DCoordinates]>,
): TUseMouseDownEvent => {
  const handleMouseDown = (event: MouseEvent): void => {
    setMousePosition({ x: event.clientX, y: event.clientY });
    onMouseDown();
    inputRef.current?.requestPointerLock?.();
  };

  return handleMouseDown;
};
