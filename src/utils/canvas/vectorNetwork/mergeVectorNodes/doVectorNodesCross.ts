// types
import { TVectorNode } from 'types/design/types';

// utils
import { findAllNetworkCrossings } from '../planarizeVectorNetwork/findAllNetworkCrossings';
import { getVectorNodeBounds } from '../getVectorNodeBounds';

export const doVectorNodesCross = (bakedNodeA: TVectorNode, bakedNodeB: TVectorNode): boolean => {
  const boundsA = getVectorNodeBounds(bakedNodeA);
  const boundsB = getVectorNodeBounds(bakedNodeB);
  const boundsOverlap = !(
    boundsA.x + boundsA.width < boundsB.x ||
    boundsA.x > boundsB.x + boundsB.width ||
    boundsA.y + boundsA.height < boundsB.y ||
    boundsA.y > boundsB.y + boundsB.height
  );

  if (boundsOverlap) {
    const segmentIdsA = new Set(Object.keys(bakedNodeA.segments));
    const { virtualVertices } = findAllNetworkCrossings([...Object.values(bakedNodeA.segments), ...Object.values(bakedNodeB.segments)], {
      ...bakedNodeA.vertices,
      ...bakedNodeB.vertices,
    });

    return Object.keys(virtualVertices).some((vertexId) => {
      const [, firstSegmentId, secondSegmentId] = vertexId.split(':');

      return segmentIdsA.has(firstSegmentId) !== segmentIdsA.has(secondSegmentId);
    });
  }

  return false;
};
