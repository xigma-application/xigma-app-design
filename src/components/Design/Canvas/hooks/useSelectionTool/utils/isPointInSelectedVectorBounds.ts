// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBounds } from '../../../utils/getNodeBounds';
import { isPointInRect } from '../../../utils/isPointInRect';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isPointInSelectedVectorBounds = (point: TPoint, selectedNodes: TSceneNode[]): boolean => {
  const [onlySelectedNode] = selectedNodes;

  if (selectedNodes.length !== 1 || onlySelectedNode.type !== NodeType.vector) {
    return false;
  }

  const bounds = getNodeBounds(onlySelectedNode);

  if (onlySelectedNode.rotation === 0) {
    return isPointInRect(point, bounds);
  }

  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const testPoint = rotatePoint(point, center, -onlySelectedNode.rotation);

  return isPointInRect(testPoint, bounds);
};
