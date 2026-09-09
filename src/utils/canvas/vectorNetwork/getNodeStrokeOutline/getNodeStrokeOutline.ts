import { nanoid } from '@reduxjs/toolkit';

// types
import { TStrokeableNode } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromLoops';
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';
import { getStrokeColor } from './getStrokeColor';
import { getStrokeOutlineLoops } from './getStrokeOutlineLoops';

export const getNodeStrokeOutline = (node: TStrokeableNode): TVectorNode | null => {
  const strokeColor = getStrokeColor(node);
  const strokeWidth = node.strokeWidth ?? 0;

  if (strokeColor && strokeWidth > 0) {
    const strokeAlign = 'strokeAlign' in node ? node.strokeAlign : undefined;
    const { inner, outer } = getStrokeAlignInset(strokeWidth, strokeAlign);
    const loops = getStrokeOutlineLoops(node, outer, inner);

    if (loops) {
      const pointLoops = loops.inner ? [loops.outer, loops.inner] : [loops.outer];

      return buildVectorNodeFromLoops(
        pointLoops,
        { id: nanoid(), name: `${node.name} outline`, parentId: null, rotation: 'rotation' in node ? node.rotation : 0 },
        strokeColor,
      );
    }
  }

  return null;
};
