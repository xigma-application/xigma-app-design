const CURSORS = {
  x: { backward: 'w-resize', both: 'ew-resize', forward: 'e-resize' },
  y: { backward: 'n-resize', both: 'ns-resize', forward: 's-resize' },
} as const;

export const getResizeCursor = (position: number, min: number, max: number, isInverted: boolean, axis: keyof typeof CURSORS): string => {
  const canMoveForward = isInverted ? position > min : position < max;
  const canMoveBackward = isInverted ? position < max : position > min;
  const cursors = CURSORS[axis];

  switch (true) {
    case canMoveForward && !canMoveBackward:
      return cursors.forward;
    case canMoveBackward && !canMoveForward:
      return cursors.backward;
    default:
      return cursors.both;
  }
};
