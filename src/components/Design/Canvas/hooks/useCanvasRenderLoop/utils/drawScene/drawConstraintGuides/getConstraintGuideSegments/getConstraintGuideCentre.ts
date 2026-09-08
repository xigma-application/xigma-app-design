// types
import { TBoxSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

export const getConstraintGuideCentre = (child: TBoxSceneNode): TPoint => {
  return { x: child.x + child.width / 2, y: child.y + child.height / 2 };
};
