// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isPointInRect } from '../../../utils/isPointInRect';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isPointInSelectedTextBounds = (point: TPoint, selectedNodes: TSceneNode[]): boolean => {
  const [onlySelectedNode] = selectedNodes;

  if (selectedNodes.length !== 1 || onlySelectedNode.type !== NodeType.text) {
    return false;
  }

  if (onlySelectedNode.rotation === 0) {
    return isPointInRect(point, onlySelectedNode);
  }

  const center: TPoint = {
    x: onlySelectedNode.x + onlySelectedNode.width / 2,
    y: onlySelectedNode.y + onlySelectedNode.height / 2,
  };
  const testPoint = rotatePoint(point, center, -onlySelectedNode.rotation);

  return isPointInRect(testPoint, onlySelectedNode);
};
