import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';

export const handleModifierKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  lastPointerClientPositionRef: RefObject<TPoint | null>,
  onPointerMove: (canvas: HTMLCanvasElement, event: PointerEvent) => void,
): void => {
  if ((event.key === 'Control' || event.key === 'Meta') && lastPointerClientPositionRef.current) {
    const { x, y } = lastPointerClientPositionRef.current;

    onPointerMove(canvas, new PointerEvent('pointermove', { clientX: x, clientY: y, ctrlKey: event.ctrlKey, metaKey: event.metaKey }));
  }
};
