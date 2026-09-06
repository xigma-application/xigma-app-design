// types
import { TPoint } from 'types/canvas';

export const createModifierKeyPointerMoveEvent = (position: TPoint, event: KeyboardEvent): PointerEvent =>
  new PointerEvent('pointermove', {
    clientX: position.x,
    clientY: position.y,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    pointerId: -1,
    shiftKey: event.shiftKey,
  });
