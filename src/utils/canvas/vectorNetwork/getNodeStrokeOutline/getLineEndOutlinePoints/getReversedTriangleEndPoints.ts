// others
import { LINE_ENDPOINT_SIZE_FACTOR } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getLineEndpointSize } from './getLineEndpointSize';

export const getReversedTriangleEndPoints = (halfWidth: number): TPoint[] => {
  const size = getLineEndpointSize(halfWidth, LINE_ENDPOINT_SIZE_FACTOR);
  const lineEdgeX = 2 * halfWidth - size;

  return [
    { x: lineEdgeX, y: halfWidth },
    { x: 0, y: size / 2 },
    { x: 0, y: -size / 2 },
    { x: lineEdgeX, y: -halfWidth },
  ];
};
