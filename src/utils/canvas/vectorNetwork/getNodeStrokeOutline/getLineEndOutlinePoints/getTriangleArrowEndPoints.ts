// others
import { LINE_ENDPOINT_SIZE_FACTOR } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getLineEndpointSize } from './getLineEndpointSize';

export const getTriangleArrowEndPoints = (halfWidth: number): TPoint[] => {
  const size = getLineEndpointSize(halfWidth, LINE_ENDPOINT_SIZE_FACTOR);

  return [
    { x: -size, y: halfWidth },
    { x: -size, y: size / 2 },
    { x: 0, y: 0 },
    { x: -size, y: -size / 2 },
    { x: -size, y: -halfWidth },
  ];
};
