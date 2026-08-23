// types
import { TVectorCutSide } from './types';

export const getIsolatedVectorCutStubIds = (sides: TVectorCutSide[], chordedVertexIds: Set<string>): Set<string> =>
  new Set(
    sides
      .filter((side) => !chordedVertexIds.has(side.sideAId) && !chordedVertexIds.has(side.sideBId))
      .flatMap((side) => [side.beforeId, side.afterId]),
  );
