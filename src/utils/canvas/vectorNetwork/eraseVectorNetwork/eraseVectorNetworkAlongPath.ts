// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork } from './types';

// utils
import { applySegmentErase } from './applySegmentErase/applySegmentErase';
import { getRemainingVertices } from '../getRemainingVertices';
import { getSegmentEraseInterval } from './getSegmentEraseInterval';

export const eraseVectorNetworkAlongPath = (node: TVectorNode, path: TPoint[], radius: number): TErasedNetwork | null => {
  let segments = node.segments;
  let vertices = node.vertices;
  let changed = false;

  Object.values(node.segments).forEach((segment) => {
    const interval = getSegmentEraseInterval(
      {
        end: node.vertices[segment.endId],
        start: node.vertices[segment.startId],
        tangentEnd: segment.tangentEnd,
        tangentStart: segment.tangentStart,
      },
      path,
      radius,
    );

    if (interval.kind !== 'none') {
      const result = applySegmentErase({ ...node, segments, vertices }, segment.id, interval);

      segments = result.segments;
      vertices = result.vertices;
      changed = true;
    }
  });

  if (changed) {
    return { segments, vertices: getRemainingVertices(vertices, segments) };
  }

  return null;
};
