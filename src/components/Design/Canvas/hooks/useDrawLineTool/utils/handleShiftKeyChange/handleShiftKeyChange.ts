import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { handlePointerMove } from '../handlePointerMove/handlePointerMove';

export const handleShiftKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  dispatch: AppDispatch,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  nodeIdRef: RefObject<string | null>,
  lastPointerClientPositionRef: RefObject<TPoint | null>,
): void => {
  if (event.key === 'Shift' && startRef.current && lastPointerClientPositionRef.current) {
    const { x, y } = lastPointerClientPositionRef.current;

    handlePointerMove(
      canvas,
      new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: -1, shiftKey: event.shiftKey }),
      dispatch,
      viewport,
      startRef,
      nodeIdRef,
      lastPointerClientPositionRef,
    );
  }
};
