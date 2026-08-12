// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isPointInRect } from '../../../utils/isPointInRect';

// a text node's precise hit area (isPointInText.ts) only covers its actual rendered lines, so once
// it's already selected, clicking anywhere in its full fixed box should still let it be dragged
export const isPointInSelectedTextBounds = (point: TPoint, selectedNodes: TSceneNode[]): boolean => {
  const [onlySelectedNode] = selectedNodes;

  return selectedNodes.length === 1 && onlySelectedNode.type === NodeType.text && isPointInRect(point, onlySelectedNode);
};
