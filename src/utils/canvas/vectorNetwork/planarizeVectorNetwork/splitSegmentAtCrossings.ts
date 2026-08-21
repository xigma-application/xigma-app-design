// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TSegmentCrossing } from './types';

// utils
import { splitCubicBezier } from '../splitCubicBezier';

export const splitSegmentAtCrossings = (
  segment: TVectorSegment,
  vertices: Record<string, TVectorVertex>,
  sortedCrossings: TSegmentCrossing[],
): Record<string, TVectorSegment> => {
  const pieces: Record<string, TVectorSegment> = {};
  const end: TPoint = vertices[segment.endId];
  let remainderStart: TPoint = vertices[segment.startId];
  let remainderStartId = segment.startId;
  let remainderTangentStart = segment.tangentStart;
  let remainderTangentEnd = segment.tangentEnd;
  let remainingLowT = 0;

  sortedCrossings.forEach((crossing, index) => {
    const localT = (crossing.t - remainingLowT) / (1 - remainingLowT);
    const split = splitCubicBezier(remainderStart, end, remainderTangentStart, remainderTangentEnd, localT);
    const pieceId = `${segment.id}#${index}`;

    pieces[pieceId] = {
      endId: crossing.vertexId,
      id: pieceId,
      startId: remainderStartId,
      tangentEnd: split.firstTangentEnd,
      tangentStart: split.firstTangentStart,
    };

    remainderStart = split.point;
    remainderStartId = crossing.vertexId;
    remainderTangentStart = split.secondTangentStart;
    remainderTangentEnd = split.secondTangentEnd;
    remainingLowT = crossing.t;
  });

  const lastPieceId = `${segment.id}#${sortedCrossings.length}`;

  pieces[lastPieceId] = {
    endId: segment.endId,
    id: lastPieceId,
    startId: remainderStartId,
    tangentEnd: remainderTangentEnd,
    tangentStart: remainderTangentStart,
  };

  return pieces;
};
