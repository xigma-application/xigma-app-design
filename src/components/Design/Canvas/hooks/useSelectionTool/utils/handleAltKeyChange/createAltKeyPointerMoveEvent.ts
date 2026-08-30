// types
import { TPoint } from 'types/canvas';

export const createAltKeyPointerMoveEvent = (position: TPoint, event: KeyboardEvent): PointerEvent =>
  new PointerEvent('pointermove', { altKey: event.altKey, clientX: position.x, clientY: position.y, pointerId: -1 });
