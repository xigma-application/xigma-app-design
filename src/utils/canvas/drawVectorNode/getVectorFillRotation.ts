// types
import { TBoxFillRotation } from './drawVectorPatternSourceTile';
import { TVectorNode } from 'types/design/types';

// utils
import { getRoundedVectorNode } from '../vectorNetwork/roundVectorCorners/getRoundedVectorNode';
import { getVectorNodeBounds } from '../vectorNetwork/getVectorNodeBounds';

export const getVectorFillRotation = (node: TVectorNode): TBoxFillRotation | undefined => {
  if (node.rotation) {
    const pivotBounds = getVectorNodeBounds(node);

    return {
      center: { x: pivotBounds.x + pivotBounds.width / 2, y: pivotBounds.y + pivotBounds.height / 2 },
      degrees: node.rotation,
      localBounds: getVectorNodeBounds(getRoundedVectorNode(node)),
    };
  }
};
