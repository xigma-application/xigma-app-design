// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TTextNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../utils/getNodeAtPoint';
import { isPointInSelectedTextBounds } from '../../useSelectionTool/utils/isPointInSelectedTextBounds';

export const getDoubleClickedTextNode = (
  point: TPoint,
  orderedNodes: TSceneNode[],
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): TTextNode | null => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);
  const [onlySelected] = selectedNodes;

  switch (true) {
    case hit?.type === NodeType.text:
      return hit;
    case onlySelected?.type === NodeType.text && isPointInSelectedTextBounds(point, selectedNodes):
      return onlySelected as TTextNode;
    default:
      return null;
  }
};
