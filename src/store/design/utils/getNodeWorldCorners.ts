// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from './getNodeAxisAlignedBounds';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getNodeWorldCorners = (node: TSceneNode): TPoint[] => {
  const bounds = getNodeAxisAlignedBounds(node);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  switch (true) {
    case node.type === NodeType.vector:
      return getRectCorners(getVectorNodeBounds(getRenderedVectorNode(node)));
    case node.rotation === 0:
      return getRectCorners(bounds);
    default:
      return getRectCorners(bounds).map((corner) => rotatePoint(corner, center, node.rotation));
  }
};
