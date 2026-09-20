// types
import { TFrameNode, TRectangleNode } from 'types/design/types';
import { TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';

export const getBoxEffectShapeRect = (node: TFrameNode | TRectangleNode, margin: number): TRoundedRect => ({
  cornerRadius: node.cornerRadius ?? 0,
  cornerRadiusBottomLeft: node.cornerRadiusBottomLeft,
  cornerRadiusBottomRight: node.cornerRadiusBottomRight,
  cornerRadiusTopLeft: node.cornerRadiusTopLeft,
  cornerRadiusTopRight: node.cornerRadiusTopRight,
  cornerSmoothing: node.cornerSmoothing,
  height: node.height,
  width: node.width,
  x: margin,
  y: margin,
});
