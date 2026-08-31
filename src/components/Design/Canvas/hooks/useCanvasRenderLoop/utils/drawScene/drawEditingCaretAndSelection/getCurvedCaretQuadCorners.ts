// types
import { TCurvedPoint } from 'utils/canvas/text/getCurvedCaretPoint';
import { TEditingTextBox, TPoint } from 'types/canvas';

// utils
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const getCurvedCaretQuadCorners = (
  localAnchor: TCurvedPoint,
  width: number,
  ascent: number,
  descent: number,
  box: TEditingTextBox,
): [TPoint, TPoint, TPoint, TPoint] => {
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const localCorners: TPoint[] = [
    { x: -width / 2, y: -ascent },
    { x: width / 2, y: -ascent },
    { x: width / 2, y: descent },
    { x: -width / 2, y: descent },
  ];

  return localCorners.map((corner) => {
    const rotated = rotatePoint(corner, ORIGIN, localAnchor.angleDegrees);
    const placed = { x: rotated.x + localAnchor.x, y: rotated.y + localAnchor.y };
    const flipped = flipTextPoint(placed, box);

    return rotatePoint(flipped, center, box.rotation);
  }) as [TPoint, TPoint, TPoint, TPoint];
};
