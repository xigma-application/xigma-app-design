// others
import { LINE_ENDPOINT_SIZE_FACTOR } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getLineEndpointSize } from './getLineEndpointSize';

export const getDiamondArrowEndPoints = (halfWidth: number): TPoint[] => {
  const half = getLineEndpointSize(halfWidth, LINE_ENDPOINT_SIZE_FACTOR) / 2;

  return [
    { x: halfWidth - half, y: halfWidth },
    { x: 0, y: half },
    { x: half, y: 0 },
    { x: 0, y: -half },
    { x: halfWidth - half, y: -halfWidth },
  ];
};
