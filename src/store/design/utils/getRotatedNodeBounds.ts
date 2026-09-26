// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeAxisAlignedBounds } from './getNodeAxisAlignedBounds';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getRotatedNodeBounds = (node: TSceneNode): TDraftRect => {
  const bounds = getNodeAxisAlignedBounds(node);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const corners = getRectCorners(bounds).map((corner) => rotatePoint(corner, center, node.rotation));
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);

  switch (true) {
    case node.type === NodeType.vector:
      return getVectorNodeBounds(getRenderedVectorNode(node));
    case node.rotation === 0:
      return bounds;
    default:
      return {
        height: Math.max(...ys) - Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        x: Math.min(...xs),
        y: Math.min(...ys),
      };
  }
};
