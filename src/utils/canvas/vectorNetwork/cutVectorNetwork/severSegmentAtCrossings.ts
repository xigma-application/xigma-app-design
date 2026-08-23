// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { splitCubicBezier } from '../splitCubicBezier';

export type TSeverCrossing = { lineT: number; point: TPoint; t: number };

export const severSegmentAtCrossings = (
  segment: TVectorSegment,
  vertices: Record<string, TVectorVertex>,
  sortedCrossings: TSeverCrossing[],
): { segments: Record<string, TVectorSegment>; vertexLineT: Record<string, number>; vertices: Record<string, TVectorVertex> } => {
  const segments: Record<string, TVectorSegment> = {};
  const newVertices: Record<string, TVectorVertex> = {};
  const vertexLineT: Record<string, number> = {};
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
    const vertexBeforeId = nanoid();
    const vertexAfterId = nanoid();

    segments[pieceId] = {
      endId: vertexBeforeId,
      id: pieceId,
      startId: remainderStartId,
      tangentEnd: split.firstTangentEnd,
      tangentStart: split.firstTangentStart,
    };
    newVertices[vertexBeforeId] = { id: vertexBeforeId, x: split.point.x, y: split.point.y };
    newVertices[vertexAfterId] = { id: vertexAfterId, x: split.point.x, y: split.point.y };
    vertexLineT[vertexBeforeId] = crossing.lineT;
    vertexLineT[vertexAfterId] = crossing.lineT;
    remainderStart = split.point;
    remainderStartId = vertexAfterId;
    remainderTangentStart = split.secondTangentStart;
    remainderTangentEnd = split.secondTangentEnd;
    remainingLowT = crossing.t;
  });

  const lastPieceId = `${segment.id}#${sortedCrossings.length}`;

  segments[lastPieceId] = {
    endId: segment.endId,
    id: lastPieceId,
    startId: remainderStartId,
    tangentEnd: remainderTangentEnd,
    tangentStart: remainderTangentStart,
  };

  return { segments, vertexLineT, vertices: newVertices };
};
