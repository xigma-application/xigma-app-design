// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode, TViewport } from 'types/design/types';

// utils
import { getNodeAtPoint } from '../../../utils/getNodeAtPoint/getNodeAtPoint';

export const getDoubleClickedVectorNode = (point: TPoint, orderedNodes: TSceneNode[], viewport: TViewport): TVectorNode | null => {
  const hit = getNodeAtPoint(point, orderedNodes, viewport);

  return hit?.type === NodeType.vector ? hit : null;
};
