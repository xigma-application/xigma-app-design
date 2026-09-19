// types
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxBrushStrokePolygons } from '../getBoxBrushStrokePolygons';
import { getCenteredRingLoops } from './getCenteredRingLoops';
import { getUniformRingPolygons } from './getUniformRingPolygons';

export const getBrushRingPolygons = (node: TFrameNode | TRectangleNode): TPoint[][] => {
  const [outerLoop, innerLoop] = getCenteredRingLoops(node);
  return getBoxBrushStrokePolygons(node, outerLoop, innerLoop) ?? getUniformRingPolygons(node);
};
