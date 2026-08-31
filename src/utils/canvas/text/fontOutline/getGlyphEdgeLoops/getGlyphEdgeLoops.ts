import { Path } from 'opentype.js';

// types
import { TWalkState } from './types';

// utils
import { applyPathCommand } from './applyPathCommand';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

export const getGlyphEdgeLoops = (path: Path): TLoopEdge[][] => {
  const origin = { x: 0, y: 0 };
  const final = path.commands.reduce<TWalkState>(applyPathCommand, { current: origin, edges: [], loops: [], subpathStart: origin });

  return final.edges.length > 0 ? [...final.loops, final.edges] : final.loops;
};
