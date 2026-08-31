// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import {
  assembleVectorNodeFromLoopGeometries,
  TVectorNodeLoopsBase,
} from './assembleVectorNodeFromLoopGeometries/assembleVectorNodeFromLoopGeometries';
import { buildClosedVectorLoop } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export type { TVectorNodeLoopsBase } from './assembleVectorNodeFromLoopGeometries/assembleVectorNodeFromLoopGeometries';

const MIN_LOOP_POINTS = 3;

export const buildVectorNodeFromLoops = (loops: TPoint[][], base: TVectorNodeLoopsBase, fillColor: string): TVectorNode | null =>
  assembleVectorNodeFromLoopGeometries(
    loops.filter((loop) => loop.length >= MIN_LOOP_POINTS).map((loop) => buildClosedVectorLoop(loop, 0)),
    base,
    fillColor,
  );
