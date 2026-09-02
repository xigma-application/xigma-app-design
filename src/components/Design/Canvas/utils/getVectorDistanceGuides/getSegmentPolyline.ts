// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenVectorSegmentById } from 'utils/canvas/vectorNetwork/flattenVectorSegmentById';

export const getSegmentPolyline = (node: TVectorNode, segmentId: string): TPoint[] => {
  const flattened = flattenVectorSegmentById(node, segmentId);

  return flattened ? flattened.points.map((point) => ({ x: point.x, y: point.y })) : [];
};
