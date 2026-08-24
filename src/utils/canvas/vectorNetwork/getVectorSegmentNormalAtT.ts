// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorSegmentPointAtT } from './getVectorSegmentPointAtT';

const NORMAL_SAMPLE_EPSILON = 0.001;

export const getVectorSegmentNormalAtT = (node: TVectorNode, segment: TVectorSegment, t: number): TPoint => {
  const before = getVectorSegmentPointAtT(node, segment, Math.max(0, t - NORMAL_SAMPLE_EPSILON));
  const after = getVectorSegmentPointAtT(node, segment, Math.min(1, t + NORMAL_SAMPLE_EPSILON));
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const length = Math.hypot(dx, dy) || 1;

  return { x: -dy / length, y: dx / length };
};
