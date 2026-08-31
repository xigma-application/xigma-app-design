// assets
import resizeCursorUrl from 'assets/icons/cursors/resize.png';
import rotateCursorUrl from 'assets/icons/cursors/rotate.png';
import scaleCursorUrl from 'assets/icons/cursors/scale.png';

// types
import type { TCursorKind } from './types';

// utils
import { createCursorRotator } from './createCursorRotator';

const rotators = {
  resize: createCursorRotator(resizeCursorUrl),
  rotate: createCursorRotator(rotateCursorUrl),
  scale: createCursorRotator(scaleCursorUrl),
};

export const getRotatedCursorUrl = (kind: TCursorKind, angle: number): string | null => {
  switch (kind) {
    case 'resize':
      return rotators.resize(angle);
    case 'rotate':
      return rotators.rotate(angle);
    case 'scale':
      return rotators.scale(angle);
    default:
      return null;
  }
};
