// types
import { TPoint } from 'types/canvas';

export const createShiftKeyPointerMoveEvent = (position: TPoint, event: KeyboardEvent): PointerEvent =>
  new PointerEvent('pointermove', { clientX: position.x, clientY: position.y, pointerId: -1, shiftKey: event.shiftKey });
