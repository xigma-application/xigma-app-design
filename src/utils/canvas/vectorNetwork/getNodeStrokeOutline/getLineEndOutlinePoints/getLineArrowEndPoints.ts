// others
import { LINE_ARROW_WING_ANGLE_DEGREES, LINE_ENDPOINT_SIZE_FACTOR } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getLineEndpointSize } from './getLineEndpointSize';

const SIN = Math.sin((LINE_ARROW_WING_ANGLE_DEGREES * Math.PI) / 180);
const COS = Math.cos((LINE_ARROW_WING_ANGLE_DEGREES * Math.PI) / 180);

export const getLineArrowEndPoints = (halfWidth: number): TPoint[] => {
  const length = getLineEndpointSize(halfWidth, LINE_ENDPOINT_SIZE_FACTOR);
  const innerReach = (halfWidth * (1 + COS)) / SIN;
  const wing = [
    { x: -halfWidth * SIN - innerReach * COS, y: halfWidth },
    { x: -length * COS - halfWidth * SIN, y: length * SIN - halfWidth * COS },
    { x: -length * COS + halfWidth * SIN, y: length * SIN + halfWidth * COS },
  ];

  return [...wing, { x: halfWidth / SIN, y: 0 }, ...[...wing].reverse().map((point) => ({ x: point.x, y: -point.y }))];
};
