// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from './getEffectiveTangentEnd';
import { getEffectiveTangentStart } from './getEffectiveTangentStart';
import { getVectorHandlePosition } from './getVectorHandlePosition';
import { isVectorHandleVisible } from './isVectorHandleVisible';

const isPointInRect = (point: TPoint, rect: TDraftRect): boolean =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;

export const getVectorHandlesInRect = (
  node: TVectorNode,
  rect: TDraftRect,
  selectedVertexIds: string[],
  oneHopVertexIds: string[],
  selectedSegmentIds: string[],
  selectedHandles: TVectorHandleHover[],
): TVectorHandleHover[] => {
  const selectedVertexIdSet = new Set(selectedVertexIds);
  const oneHopVertexIdSet = new Set(oneHopVertexIds);
  const selectedSegmentIdSet = new Set(selectedSegmentIds);

  return Object.values(node.segments).flatMap((segment) => {
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];
    const handleStart = getVectorHandlePosition(start, getEffectiveTangentStart(node.vertices, segment));
    const handleEnd = getVectorHandlePosition(end, getEffectiveTangentEnd(node.vertices, segment));
    const hits: TVectorHandleHover[] = [];

    if (
      handleStart &&
      isPointInRect(handleStart, rect) &&
      isVectorHandleVisible(segment, 'start', selectedVertexIdSet, oneHopVertexIdSet, selectedSegmentIdSet, selectedHandles)
    ) {
      hits.push({ end: 'start', segmentId: segment.id });
    }

    if (
      handleEnd &&
      isPointInRect(handleEnd, rect) &&
      isVectorHandleVisible(segment, 'end', selectedVertexIdSet, oneHopVertexIdSet, selectedSegmentIdSet, selectedHandles)
    ) {
      hits.push({ end: 'end', segmentId: segment.id });
    }

    return hits;
  });
};
