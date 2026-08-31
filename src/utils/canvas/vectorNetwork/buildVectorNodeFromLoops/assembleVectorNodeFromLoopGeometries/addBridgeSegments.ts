// types
import { TVectorSegment } from 'types/design/types';

export const addBridgeSegments = (loopAnchorVertexIds: string[], segments: Record<string, TVectorSegment>): string[] => {
  const [firstAnchorId, ...otherAnchorIds] = loopAnchorVertexIds;

  return otherAnchorIds.map((anchorId) => {
    const bridgeId = `${firstAnchorId}-${anchorId}-bridge`;
    segments[bridgeId] = { endId: anchorId, id: bridgeId, startId: firstAnchorId, tangentEnd: null, tangentStart: null };

    return bridgeId;
  });
};
