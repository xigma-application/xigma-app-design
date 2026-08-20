// types
import { TPoint } from 'types/canvas';
import { TVectorBendDragCandidate } from 'types/design/selectionTool/types';
import { TVectorEdgeMatch } from './getVectorEdgeAtPoint';
import { TVectorNode } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';

export const getVectorBendDragCandidates = (matches: TVectorEdgeMatch[], node: TVectorNode, point: TPoint): TVectorBendDragCandidate[] =>
  matches.map(({ segmentId }) => {
    const segment = node.segments[segmentId];
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];
    const nearVertex = Math.hypot(point.x - start.x, point.y - start.y) <= Math.hypot(point.x - end.x, point.y - end.y) ? start : end;
    const farVertex = nearVertex === start ? end : start;

    return { angle: getAngleBetweenPoints(nearVertex, farVertex), segmentId };
  });
