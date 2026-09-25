// types
import { TPoint } from 'types/canvas';
import { TStrokeableNode } from './types';

// utils
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';
import { getStrokeOutlineLoops } from './getStrokeOutlineLoops';

export const getAlignedStrokeOutlineLoops = (node: TStrokeableNode, strokeWidth: number): TPoint[][] | null => {
  const { inner, outer } = getStrokeAlignInset(strokeWidth, 'strokeAlign' in node ? node.strokeAlign : undefined);
  const loops = getStrokeOutlineLoops(node, outer, inner);

  if (loops) {
    return loops.inner ? [loops.outer, loops.inner] : [loops.outer];
  }

  return null;
};
