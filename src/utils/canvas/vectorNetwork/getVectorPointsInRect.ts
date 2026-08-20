// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

const isPointInRect = (point: TPoint, rect: TDraftRect): boolean =>
  point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;

export const getVectorPointsInRect = (node: TVectorNode, rect: TDraftRect): string[] =>
  Object.values(node.vertices)
    .filter((vertex) => isPointInRect(vertex, rect))
    .map((vertex) => vertex.id);
