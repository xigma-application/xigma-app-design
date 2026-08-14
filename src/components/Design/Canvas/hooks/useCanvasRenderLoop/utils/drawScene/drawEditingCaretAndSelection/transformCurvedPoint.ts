// types
import { TCurvedPoint } from 'utils/canvas/text/getCurvedCaretPoint';
import { TEditingTextBox, TPoint } from 'types/canvas';

// utils
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const flipAngle = (angleDegrees: number, box: TEditingTextBox): number => {
  switch (true) {
    case box.flipX && box.flipY:
      return 180 + angleDegrees;
    case box.flipX:
      return 180 - angleDegrees;
    case box.flipY:
      return -angleDegrees;
    default:
      return angleDegrees;
  }
};

export const transformCurvedPoint = <TPointOrRect extends TCurvedPoint>(point: TPointOrRect, box: TEditingTextBox): TPointOrRect => {
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const flipped = flipTextPoint(point, box);
  const rotated = rotatePoint(flipped, center, box.rotation);

  return { ...point, angleDegrees: flipAngle(point.angleDegrees, box) + box.rotation, x: rotated.x, y: rotated.y };
};
