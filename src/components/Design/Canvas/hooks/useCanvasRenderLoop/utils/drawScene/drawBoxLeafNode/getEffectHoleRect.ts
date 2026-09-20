// types
import { TEffect, TFrameNode, TRectangleNode } from 'types/design/types';
import { TRoundedRect } from 'utils/canvas/shapes/getRoundedRectPoints';

const shrinkRadius = (radius: number | undefined, fallback: number, spread: number): number => Math.max(0, (radius ?? fallback) - spread);

export const getEffectHoleRect = (node: TFrameNode | TRectangleNode, effect: TEffect, margin: number): TRoundedRect => {
  const fallback = node.cornerRadius ?? 0;

  return {
    cornerRadius: 0,
    cornerRadiusBottomLeft: shrinkRadius(node.cornerRadiusBottomLeft, fallback, effect.spread),
    cornerRadiusBottomRight: shrinkRadius(node.cornerRadiusBottomRight, fallback, effect.spread),
    cornerRadiusTopLeft: shrinkRadius(node.cornerRadiusTopLeft, fallback, effect.spread),
    cornerRadiusTopRight: shrinkRadius(node.cornerRadiusTopRight, fallback, effect.spread),
    cornerSmoothing: node.cornerSmoothing,
    height: Math.max(0, node.height - effect.spread * 2),
    width: Math.max(0, node.width - effect.spread * 2),
    x: margin + effect.spread + effect.x,
    y: margin + effect.spread + effect.y,
  };
};
