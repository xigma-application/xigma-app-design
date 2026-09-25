// types
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { buildStrokeRing } from '../buildStrokeRing';
import { getBoxBrushStrokePolygons } from '../getBoxBrushStrokePolygons';
import { getCenteredRingLoops } from './getCenteredRingLoops';
import { getUniformRingPolygons } from './getUniformRingPolygons';

export const getBrushRingPolygons = (node: TFrameNode | TRectangleNode | TSectionNode): TPoint[][] => {
  const [outerLoop, innerLoop] = getCenteredRingLoops(node);
  return getBoxBrushStrokePolygons(node, buildStrokeRing(outerLoop, innerLoop)) ?? getUniformRingPolygons(node);
};
