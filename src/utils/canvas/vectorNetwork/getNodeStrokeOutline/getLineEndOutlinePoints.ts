// others
import { ARROWHEAD_LENGTH, ARROWHEAD_STROKE_WIDTH, ARROWHEAD_WING_ANGLE_DEGREES } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

const WING_HALF_WIDTH = ARROWHEAD_STROKE_WIDTH / 2;
const SIN = Math.sin((ARROWHEAD_WING_ANGLE_DEGREES * Math.PI) / 180);
const COS = Math.cos((ARROWHEAD_WING_ANGLE_DEGREES * Math.PI) / 180);

const mirror = (points: TPoint[]): TPoint[] => [...points].reverse().map((point) => ({ x: point.x, y: -point.y }));

const getTipPoints = (halfWidth: number): TPoint[] => {
  if (halfWidth > WING_HALF_WIDTH / COS) {
    const outerX = (WING_HALF_WIDTH - halfWidth * COS) / SIN;

    return [
      { x: outerX, y: halfWidth },
      { x: 0, y: halfWidth },
      { x: 0, y: -halfWidth },
      { x: outerX, y: -halfWidth },
    ];
  }

  return [{ x: WING_HALF_WIDTH / SIN, y: 0 }];
};

export const getLineEndOutlinePoints = (halfWidth: number, hasArrow: boolean): TPoint[] => {
  const innerReach = (halfWidth + WING_HALF_WIDTH * COS) / SIN;

  if (hasArrow) {
    if (innerReach <= ARROWHEAD_LENGTH) {
      const wing = [
        { x: -WING_HALF_WIDTH * SIN - innerReach * COS, y: halfWidth },
        { x: -ARROWHEAD_LENGTH * COS - WING_HALF_WIDTH * SIN, y: ARROWHEAD_LENGTH * SIN - WING_HALF_WIDTH * COS },
        { x: -ARROWHEAD_LENGTH * COS + WING_HALF_WIDTH * SIN, y: ARROWHEAD_LENGTH * SIN + WING_HALF_WIDTH * COS },
      ];

      return [...wing, ...getTipPoints(halfWidth), ...mirror(wing)];
    }
  }

  return [
    { x: 0, y: halfWidth },
    { x: 0, y: -halfWidth },
  ];
};
