// others
import { BOOLEAN_BOUNDARY_SAMPLE_OFFSET } from './constants';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorSegmentNormalAtT } from '../vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from '../vectorNetwork/getVectorSegmentPointAtT';

export const isBooleanBoundarySegment = (node: TVectorNode, segment: TVectorSegment, isInside: (point: TPoint) => boolean): boolean => {
  const point = getVectorSegmentPointAtT(node, segment, 0.5);
  const normal = getVectorSegmentNormalAtT(node, segment, 0.5);
  const left = { x: point.x + normal.x * BOOLEAN_BOUNDARY_SAMPLE_OFFSET, y: point.y + normal.y * BOOLEAN_BOUNDARY_SAMPLE_OFFSET };
  const right = { x: point.x - normal.x * BOOLEAN_BOUNDARY_SAMPLE_OFFSET, y: point.y - normal.y * BOOLEAN_BOUNDARY_SAMPLE_OFFSET };

  return isInside(left) !== isInside(right);
};
