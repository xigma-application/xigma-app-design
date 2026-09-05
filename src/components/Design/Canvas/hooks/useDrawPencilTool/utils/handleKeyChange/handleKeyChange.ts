// types
import { TPoint } from 'types/canvas';

export const handleKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  onPointerMove: (canvas: HTMLCanvasElement, event: PointerEvent) => void,
  lastPointerClientPosition: TPoint | null,
): void => {
  if ((event.key === 'Shift' || event.key === 'Control' || event.key === 'Meta') && lastPointerClientPosition) {
    const { x, y } = lastPointerClientPosition;

    onPointerMove(
      canvas,
      new PointerEvent('pointermove', {
        clientX: x,
        clientY: y,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        pointerId: -1,
        shiftKey: event.shiftKey,
      }),
    );
  }
};
