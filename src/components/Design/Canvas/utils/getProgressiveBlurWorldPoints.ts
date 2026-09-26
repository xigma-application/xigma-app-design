// types
import { TEffect } from 'types/design/types';
import { TOpenProgressiveBlur } from './getOpenProgressiveBlur';
import { TPoint } from 'types/canvas';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TProgressiveBlurWorldPoints = { end: TPoint; start: TPoint };

export const getProgressiveBlurWorldPoints = (node: TOpenProgressiveBlur['node'], effect: TEffect): TProgressiveBlurWorldPoints => {
  const { end, start } = getProgressiveBlur(effect);
  const bounds = getNodeBounds(node);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const toWorld = (normalized: TPoint): TPoint =>
    rotatePoint({ x: bounds.x + normalized.x * bounds.width, y: bounds.y + normalized.y * bounds.height }, center, node.rotation);

  return { end: toWorld(end), start: toWorld(start) };
};
