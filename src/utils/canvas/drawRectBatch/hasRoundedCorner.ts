// types
import { TRectangleNode } from 'types/design/types';

export const hasRoundedCorner = (node: TRectangleNode): boolean =>
  Boolean(
    node.cornerRadius ||
    node.cornerRadiusTopLeft ||
    node.cornerRadiusTopRight ||
    node.cornerRadiusBottomLeft ||
    node.cornerRadiusBottomRight,
  );
