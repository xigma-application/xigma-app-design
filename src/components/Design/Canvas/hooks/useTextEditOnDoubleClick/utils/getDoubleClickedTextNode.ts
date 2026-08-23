// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TTextNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../utils/getNodeAtPoint';

export const getDoubleClickedTextNode = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TTextNode | null => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);

  return hit?.type === NodeType.text ? hit : null;
};
