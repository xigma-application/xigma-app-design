// types
import { TVectorNode } from 'types/design/types';

// utils
import {
  assembleVectorNodeFromLoopGeometries,
  TVectorNodeLoopsBase,
} from './assembleVectorNodeFromLoopGeometries/assembleVectorNodeFromLoopGeometries';
import { buildClosedLoopFromEdges, TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

const MIN_LOOP_EDGES = 3;

export const buildVectorNodeFromEdgeLoops = (edgeLoops: TLoopEdge[][], base: TVectorNodeLoopsBase, fillColor: string): TVectorNode | null =>
  assembleVectorNodeFromLoopGeometries(
    edgeLoops.filter((edges) => edges.length >= MIN_LOOP_EDGES).map((edges) => buildClosedLoopFromEdges(edges)),
    base,
    fillColor,
  );
