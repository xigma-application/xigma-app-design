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

// only ever catches a handle that's actually visible (§10's reveal rule) — a marquee sweeping over
// otherwise-hidden tangent geometry must not silently select it, the same way you could never click it
export const getVectorHandlesInRect = (
  node: TVectorNode,
  rect: TDraftRect,
  selectedVertexIds: string[],
  oneHopVertexIds: string[],
  selectedSegmentIds: string[],
  selectedHandles: TVectorHandleHover[],
): TVectorHandleHover[] =>
  Object.values(node.segments).flatMap((segment) => {
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];
    const handleStart = getVectorHandlePosition(start, getEffectiveTangentStart(node.vertices, segment));
    const handleEnd = getVectorHandlePosition(end, getEffectiveTangentEnd(node.vertices, segment));
    const hits: TVectorHandleHover[] = [];

    if (
      handleStart &&
      isPointInRect(handleStart, rect) &&
      isVectorHandleVisible(segment, 'start', selectedVertexIds, oneHopVertexIds, selectedSegmentIds, selectedHandles)
    ) {
      hits.push({ end: 'start', segmentId: segment.id });
    }

    if (
      handleEnd &&
      isPointInRect(handleEnd, rect) &&
      isVectorHandleVisible(segment, 'end', selectedVertexIds, oneHopVertexIds, selectedSegmentIds, selectedHandles)
    ) {
      hits.push({ end: 'end', segmentId: segment.id });
    }

    return hits;
  });
