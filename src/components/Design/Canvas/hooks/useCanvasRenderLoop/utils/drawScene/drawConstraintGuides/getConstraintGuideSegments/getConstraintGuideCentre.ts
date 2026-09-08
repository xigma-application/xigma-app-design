// store
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

// types
import { TBoxSceneNode } from 'types/design/types';
import { TConstraintGuideParent } from './types';
import { TPoint } from 'types/canvas';

export const getConstraintGuideCentre = (child: TBoxSceneNode, parent: TConstraintGuideParent): TPoint => {
  const local = getNodePositionInParent({ x: child.x, y: child.y }, parent);
  return getNodeAbsoluteFromParentPosition({ x: local.x + child.width / 2, y: local.y + child.height / 2 }, parent);
};
