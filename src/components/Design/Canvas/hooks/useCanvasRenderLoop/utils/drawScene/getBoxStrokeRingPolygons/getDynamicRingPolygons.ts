// types
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxDynamicStrokePolygons } from '../getBoxDynamicStrokePolygons';
import { getCenteredRingLoops } from './getCenteredRingLoops';
import { getStrokeDynamicValues } from 'utils/design/stroke/getStrokeDynamicValues';
import { getUniformRingPolygons } from './getUniformRingPolygons';

export const getDynamicRingPolygons = (node: TFrameNode | TRectangleNode): TPoint[][] => {
  const [outerLoop, innerLoop] = getCenteredRingLoops(node);

  return (
    getBoxDynamicStrokePolygons(outerLoop, innerLoop, {
      ...getStrokeDynamicValues(node),
      seed: node.id,
      strokeWidth: node.strokeWidth ?? 0,
    }) ?? getUniformRingPolygons(node)
  );
};
