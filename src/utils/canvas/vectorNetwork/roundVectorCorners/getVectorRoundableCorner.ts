// types
import { TVectorNode } from 'types/design/types';
import { TVectorRoundableCorner } from './types';

// utils
import { isStraightVectorSegmentAt } from './isStraightVectorSegmentAt';

export const getVectorRoundableCorner = (
  node: Pick<TVectorNode, 'segments' | 'vertices'>,
  vertexId: string,
  segmentIds: string[],
): TVectorRoundableCorner | null => {
  const [first, second] = segmentIds.map((id) => node.segments[id]);

  if (segmentIds.length === 2 && isStraightVectorSegmentAt(first, vertexId) && isStraightVectorSegmentAt(second, vertexId)) {
    const firstEndId = first.startId === vertexId ? first.endId : first.startId;
    const secondEndId = second.startId === vertexId ? second.endId : second.startId;

    if (firstEndId !== secondEndId) {
      return { first, firstEnd: node.vertices[firstEndId], second, secondEnd: node.vertices[secondEndId] };
    }
  }

  return null;
};
