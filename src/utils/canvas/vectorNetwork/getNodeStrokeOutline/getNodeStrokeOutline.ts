import { nanoid } from '@reduxjs/toolkit';

// types
import { TStrokeableNode } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromLoops';
import { getAlignedStrokeOutlineLoops } from './getAlignedStrokeOutlineLoops';
import { getModeStrokeOutlineLoops } from './getModeStrokeOutlineLoops';
import { getStrokeColor } from './getStrokeColor';
import { getStrokeOutlineRotation } from './getStrokeOutlineRotation';
import { getStrokeOutlineWidth } from './getStrokeOutlineWidth';

export const getNodeStrokeOutline = (node: TStrokeableNode): TVectorNode | null => {
  const strokeColor = getStrokeColor(node);
  const strokeWidth = getStrokeOutlineWidth(node);

  if (strokeColor && strokeWidth > 0) {
    const pointLoops = getModeStrokeOutlineLoops(node) ?? getAlignedStrokeOutlineLoops(node, strokeWidth);

    if (pointLoops) {
      return buildVectorNodeFromLoops(
        pointLoops,
        { id: nanoid(), name: `${node.name} outline`, parentId: null, rotation: getStrokeOutlineRotation(node) },
        strokeColor,
      );
    }
  }

  return null;
};
