// types
import { TBooleanNode, TEffect, TEllipseNode, TFrameNode, TPolygonNode, TRectangleNode, TSectionNode, TStarNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TProgressiveBlurWorldPoints = { end: TPoint; start: TPoint };

export const getProgressiveBlurWorldPoints = (
  node: TBooleanNode | TEllipseNode | TFrameNode | TPolygonNode | TRectangleNode | TSectionNode | TStarNode,
  effect: TEffect,
): TProgressiveBlurWorldPoints => {
  const { end, start } = getProgressiveBlur(effect);
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const toWorld = (normalized: TPoint): TPoint =>
    rotatePoint({ x: node.x + normalized.x * node.width, y: node.y + normalized.y * node.height }, center, node.rotation);

  return { end: toWorld(end), start: toWorld(start) };
};
