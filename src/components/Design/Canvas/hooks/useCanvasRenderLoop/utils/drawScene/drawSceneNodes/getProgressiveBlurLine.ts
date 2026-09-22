// types
import { TMaskRenderer } from './types';
import { TProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getDevicePixelHeight } from '../getDevicePixelHeight';
import { getDevicePixelWidth } from '../getDevicePixelWidth';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getProgressiveBlurLine = (
  renderer: TMaskRenderer,
  bounds: TDraftRect,
  rotation: number,
  progressive: TProgressiveBlur,
): [number, number, number, number] => {
  const { context, gl } = renderer;
  const { viewport } = context;
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const pixelRatio = context.canvasWidth > 0 ? getDevicePixelWidth(context, gl) / context.canvasWidth : 1;
  const toTargetPixels = (normalized: TPoint): TPoint => {
    const world = rotatePoint({ x: bounds.x + normalized.x * bounds.width, y: bounds.y + normalized.y * bounds.height }, center, rotation);

    return {
      x: (world.x * viewport.zoom + viewport.x) * pixelRatio,
      y: getDevicePixelHeight(context, gl) - (world.y * viewport.zoom + viewport.y) * pixelRatio,
    };
  };
  const start = toTargetPixels(progressive.start);
  const end = toTargetPixels(progressive.end);

  return [start.x, start.y, end.x, end.y];
};
