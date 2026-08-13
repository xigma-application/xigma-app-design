// types
import { TResizeHandle } from 'types/canvas';

export const getResizeCursorAngle = (handle: TResizeHandle, rotation: number): number => {
  switch (handle) {
    case 'e':
    case 'w':
      return rotation;
    case 'n':
    case 's':
      return 90 + rotation;
    case 'ne':
    case 'sw':
      return -45 + rotation;
    default:
      return 45 + rotation;
  }
};
