// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TShapeOrVectorNode } from '../../../../../types';

// utils
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';

export const hasShapeCorners = (node: TShapeOrVectorNode): boolean => {
  switch (node.type) {
    case NodeType.ellipse:
      return hasEllipseArc(node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE, node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE);
    default:
      return true;
  }
};
