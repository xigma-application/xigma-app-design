// types
import { TEffect, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';

const growRadius = (radius: number | undefined, fallback: number, spread: number): number => Math.max(0, (radius ?? fallback) + spread);

export const getDropShadowRect = (node: TFrameNode | TRectangleNode | TSectionNode, effect: TEffect, margin: number): TRoundedRect => {
  const fallback = node.cornerRadius ?? 0;

  return {
    cornerRadius: 0,
    cornerRadiusBottomLeft: growRadius(node.cornerRadiusBottomLeft, fallback, effect.spread),
    cornerRadiusBottomRight: growRadius(node.cornerRadiusBottomRight, fallback, effect.spread),
    cornerRadiusTopLeft: growRadius(node.cornerRadiusTopLeft, fallback, effect.spread),
    cornerRadiusTopRight: growRadius(node.cornerRadiusTopRight, fallback, effect.spread),
    cornerSmoothing: node.cornerSmoothing,
    height: Math.max(0, node.height + effect.spread * 2),
    width: Math.max(0, node.width + effect.spread * 2),
    x: margin - effect.spread + effect.x,
    y: margin - effect.spread + effect.y,
  };
};
