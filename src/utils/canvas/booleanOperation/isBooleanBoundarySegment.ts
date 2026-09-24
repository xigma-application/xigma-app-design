// others
import { BOOLEAN_CURVE_BOUNDARY_SAMPLE_OFFSET, BOOLEAN_STRAIGHT_SAMPLE_OFFSET } from './constants';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorSegmentNormalAtT } from '../vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from '../vectorNetwork/getVectorSegmentPointAtT';
import { isStraightVectorSegment } from './isStraightVectorSegment';

export const isBooleanBoundarySegment = (node: TVectorNode, segment: TVectorSegment, isInside: (point: TPoint) => boolean): boolean => {
  const point = getVectorSegmentPointAtT(node, segment, 0.5);
  const normal = getVectorSegmentNormalAtT(node, segment, 0.5);
  const offset = isStraightVectorSegment(segment) ? BOOLEAN_STRAIGHT_SAMPLE_OFFSET : BOOLEAN_CURVE_BOUNDARY_SAMPLE_OFFSET;
  const left = { x: point.x + normal.x * offset, y: point.y + normal.y * offset };
  const right = { x: point.x - normal.x * offset, y: point.y - normal.y * offset };

  return isInside(left) !== isInside(right);
};
