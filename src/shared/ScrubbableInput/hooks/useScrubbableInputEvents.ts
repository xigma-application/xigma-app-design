import { RefObject, useState } from 'react';

// hooks
import { useMouseDownEvent } from './useMouseDownEvent';
import { useMouseMoveEvent } from './useMouseMoveEvent';
import { useMouseUpEvent } from './useMouseUpEvent';

export type TUseScrubbableInputEvents = {
  mousePosition: T2DCoordinates | null;
  onMouseDown: TFunc<[React.MouseEvent<HTMLElement, MouseEvent>]>;
  onMouseUp: TFunc<[React.MouseEvent<HTMLElement, MouseEvent>]>;
};

export const useScrubbableInputEvents = (
  inputRef: RefObject<HTMLDivElement | null>,
  loop: boolean,
  max: number,
  min: number,
  onChange: TFunc<[number]>,
  onMouseDown: TFunc,
  onMouseUp: TFunc,
  value: number,
): TUseScrubbableInputEvents => {
  const [mousePosition, setMousePosition] = useState<T2DCoordinates | null>(null);

  useMouseMoveEvent(max, min, loop, mousePosition, onChange, setMousePosition, value);

  return {
    mousePosition,
    onMouseDown: useMouseDownEvent(inputRef, onMouseDown, setMousePosition),
    onMouseUp: useMouseUpEvent(onMouseUp, setMousePosition),
  };
};
