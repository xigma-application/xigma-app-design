// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TVectorCutSide } from './types';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorFaceAtPoint } from 'components/Design/Canvas/utils/getVectorFaceAtPoint';

export const buildVectorCutChordSegments = (
  sides: TVectorCutSide[],
  originalNode: TVectorNode,
): { chordSegments: Record<string, TVectorSegment>; chordedVertexIds: Set<string> } => {
  const chordedVertexIds = new Set<string>();
  const chordSegments = sides.slice(0, -1).reduce(
    (acc, current, index) => {
      const next = sides[index + 1];
      const midpoint: TPoint = { x: (current.point.x + next.point.x) / 2, y: (current.point.y + next.point.y) / 2 };

      if (getVectorFaceAtPoint(midpoint, originalNode) !== null) {
        const chordAId = nanoid();
        const chordBId = nanoid();

        chordedVertexIds.add(current.sideAId).add(current.sideBId).add(next.sideAId).add(next.sideBId);

        return {
          ...acc,
          [chordAId]: { endId: next.sideAId, id: chordAId, startId: current.sideAId, tangentEnd: null, tangentStart: null },
          [chordBId]: { endId: next.sideBId, id: chordBId, startId: current.sideBId, tangentEnd: null, tangentStart: null },
        };
      }

      return acc;
    },
    {} as Record<string, TVectorSegment>,
  );

  return { chordSegments, chordedVertexIds };
};
