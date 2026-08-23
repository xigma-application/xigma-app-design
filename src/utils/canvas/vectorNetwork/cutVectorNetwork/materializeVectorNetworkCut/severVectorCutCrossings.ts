// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TLineNetworkCrossing } from '../types';
import { TVectorCutSide } from './types';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { splitCubicBezier } from '../../splitCubicBezier';

export const severVectorCutCrossings = (
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  sortedCrossings: TLineNetworkCrossing[],
  lineDirection: TPoint,
): { segments: Record<string, TVectorSegment>; sides: TVectorCutSide[]; vertices: Record<string, TVectorVertex> } =>
  sortedCrossings.reduce(
    (acc, crossing) => {
      const segment = acc.segments[crossing.segmentId];
      const start = acc.vertices[segment.startId];
      const end = acc.vertices[segment.endId];
      const split = splitCubicBezier(start, end, segment.tangentStart, segment.tangentEnd, crossing.t);
      const sideAId = nanoid();
      const sideBId = nanoid();
      const segmentDirection: TPoint = { x: end.x - start.x, y: end.y - start.y };
      const towardStartIsSideA = lineDirection.x * segmentDirection.y - lineDirection.y * segmentDirection.x >= 0;
      const [towardStartId, towardEndId] = towardStartIsSideA ? [sideAId, sideBId] : [sideBId, sideAId];
      const remainingSegments = Object.fromEntries(Object.entries(acc.segments).filter(([id]) => id !== crossing.segmentId));
      const beforeId = nanoid();
      const afterId = nanoid();

      return {
        segments: {
          ...remainingSegments,
          [afterId]: {
            endId: segment.endId,
            id: afterId,
            startId: towardEndId,
            tangentEnd: split.secondTangentEnd,
            tangentStart: split.secondTangentStart,
          },
          [beforeId]: {
            endId: towardStartId,
            id: beforeId,
            startId: segment.startId,
            tangentEnd: split.firstTangentEnd,
            tangentStart: split.firstTangentStart,
          },
        },
        sides: [...acc.sides, { afterId, beforeId, point: split.point, sideAId, sideBId }],
        vertices: {
          ...acc.vertices,
          [sideAId]: { id: sideAId, x: split.point.x, y: split.point.y },
          [sideBId]: { id: sideBId, x: split.point.x, y: split.point.y },
        },
      };
    },
    { segments, sides: [] as TVectorCutSide[], vertices },
  );
