import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TLineEndpointStyle, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerMove } from '../handlePointerMove/handlePointerMove';

export const handleShiftKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  lastPointerClientPositionRef: RefObject<TPoint | null>,
  endPoint: TLineEndpointStyle,
  startPoint: TLineEndpointStyle,
  stroke: string,
): void => {
  if (event.key === 'Shift' && startRef.current && lastPointerClientPositionRef.current) {
    const { x, y } = lastPointerClientPositionRef.current;

    handlePointerMove(
      canvas,
      new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: -1, shiftKey: event.shiftKey }),
      canvasRefs,
      viewport,
      startRef,
      lastPointerClientPositionRef,
      endPoint,
      startPoint,
      stroke,
    );
  }
};
