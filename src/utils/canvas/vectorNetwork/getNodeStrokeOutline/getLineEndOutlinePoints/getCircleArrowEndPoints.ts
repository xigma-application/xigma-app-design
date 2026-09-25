// others
import { LINE_CIRCLE_ENDPOINT_SIZE_FACTOR, LINE_ENDPOINT_ARC_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';

// utils
import { getLineEndpointSize } from './getLineEndpointSize';

export const getCircleArrowEndPoints = (halfWidth: number): TPoint[] => {
  const radius = getLineEndpointSize(halfWidth, LINE_CIRCLE_ENDPOINT_SIZE_FACTOR) / 2;
  const startAngle = Math.PI - Math.asin(halfWidth / radius);
  const segments = LINE_ENDPOINT_ARC_SEGMENTS * 2;

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle - (2 * startAngle * index) / segments;

    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
};
