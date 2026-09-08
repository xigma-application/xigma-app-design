// store
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

// types
import { TBoxSceneNode } from 'types/design/types';
import { TChildLocalExtent, TConstraintGuideParent } from './types';

// utils
import { getAxisHalfExtent } from './getAxisHalfExtent';

export const getChildLocalExtent = (child: TBoxSceneNode, parent: TConstraintGuideParent): TChildLocalExtent => {
  const centre = getNodePositionInParent({ x: child.x + child.width / 2, y: child.y + child.height / 2 }, parent);
  const radians = ((child.rotation - parent.rotation) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const halfWidth = child.width / 2;
  const halfHeight = child.height / 2;

  return {
    centre,
    halfX: getAxisHalfExtent(cos, sin, halfWidth, halfHeight),
    halfY: getAxisHalfExtent(sin, cos, halfWidth, halfHeight),
  };
};
