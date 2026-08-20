// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getEffectiveTangentStart } from './getEffectiveTangentStart';
import { getVectorHandlePosition } from './getVectorHandlePosition';

const isPointInRect = (point: TPoint, rect: TDraftRect): boolean =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;

const getSegmentHandlesInRect = (node: TVectorNode, segment: TVectorSegment, rect: TDraftRect): TVectorHandleHover[] => {
  const start = getVectorHandlePosition(node.vertices[segment.startId], getEffectiveTangentStart(node.vertices, segment));
  const end = getVectorHandlePosition(node.vertices[segment.endId], segment.tangentEnd);
  const handles: TVectorHandleHover[] = [];

  if (start && isPointInRect(start, rect)) {
    handles.push({ end: 'start', segmentId: segment.id });
  }

  if (end && isPointInRect(end, rect)) {
    handles.push({ end: 'end', segmentId: segment.id });
  }

  return handles;
};

export type TVectorPointsInRect = { handles: TVectorHandleHover[]; vertexIds: string[] };

export const getVectorPointsInRect = (node: TVectorNode, rect: TDraftRect): TVectorPointsInRect => ({
  handles: Object.values(node.segments).flatMap((segment) => getSegmentHandlesInRect(node, segment, rect)),
  vertexIds: Object.values(node.vertices)
    .filter((vertex) => isPointInRect(vertex, rect))
    .map((vertex) => vertex.id),
});
