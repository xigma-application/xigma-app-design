// types
import { TBrushContourPoint, TBrushStrip } from '../types';

// others
import { MIN_LOOP_AREA, SIMPLIFY_EPSILON } from './constants';

// utils
import { buildContourGraph } from './buildContourGraph';
import { getLoopArea } from './getLoopArea';
import { normalizeContourLoop } from './normalizeContourLoop';
import { simplifyBrushLoop } from '../simplifyBrushLoop';
import { walkContourLoops } from './walkContourLoops';

export const traceBrushContours = (strip: TBrushStrip): TBrushContourPoint[][] =>
  walkContourLoops(buildContourGraph(strip))
    .filter((loop) => loop.length >= 3 && getLoopArea(loop) >= MIN_LOOP_AREA)
    .map((loop) => normalizeContourLoop(simplifyBrushLoop(loop, SIMPLIFY_EPSILON), strip));
