// types
import { EffectType, NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TMaskRenderer, TScissorRect } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { getDropShadowMargin } from '../drawBoxLeafNode/getDropShadowMargin';
import { getNodeBlurParams } from './getNodeBlurParams';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

const SCISSOR_PADDING_PX = 4;

const getShadowMargin = (node: TSceneNode): number =>
  'effects' in node
    ? (node.effects ?? []).reduce(
        (margin, effect) => (effect.type === EffectType.dropShadow ? Math.max(margin, getDropShadowMargin(effect)) : margin),
        0,
      )
    : 0;

const getRotatedCorners = (bounds: TDraftRect, rotation: number): TPoint[] => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ].map((corner) => rotatePoint(corner, center, rotation));
};

export const getIsolatedScissorRect = (renderer: TMaskRenderer, node: TSceneNode): TScissorRect | null => {
  const isSimpleBox =
    (node.type === NodeType.rectangle || node.type === NodeType.frame) && !('childIds' in node && node.childIds.length > 0);
  const blur = isSimpleBox ? getNodeBlurParams(renderer, node, EffectType.layerBlur) : null;

  if (isSimpleBox && blur) {
    const { context, gl } = renderer;
    const { viewport } = context;
    const bounds = getNodeBounds(node);
    const rotation = 'rotation' in node ? node.rotation : 0;
    const pixelRatio = context.canvasWidth > 0 ? gl.drawingBufferWidth / context.canvasWidth : 1;
    const scale = viewport.zoom * pixelRatio;
    const strokeWidth = 'strokeWidth' in node ? (node.strokeWidth ?? 0) : 0;
    const margin = blur.radius * 2 + (getShadowMargin(node) + strokeWidth) * Math.max(1, scale) + SCISSOR_PADDING_PX;
    const corners = getRotatedCorners(bounds, rotation);
    const xs = corners.map((corner) => (corner.x * viewport.zoom + viewport.x) * pixelRatio);
    const ys = corners.map((corner) => (corner.y * viewport.zoom + viewport.y) * pixelRatio);
    const rawLeft = Math.floor(Math.min(...xs) - margin);
    const rawRight = Math.ceil(Math.max(...xs) + margin);
    const rawBottom = Math.floor(gl.drawingBufferHeight - Math.max(...ys) - margin);
    const rawTop = Math.ceil(gl.drawingBufferHeight - Math.min(...ys) + margin);
    const left = Math.max(0, rawLeft);
    const right = Math.min(gl.drawingBufferWidth, rawRight);
    const bottom = Math.max(0, rawBottom);
    const top = Math.min(gl.drawingBufferHeight, rawTop);

    if (right > left && top > bottom) {
      return {
        clipped: left !== rawLeft || right !== rawRight || bottom !== rawBottom || top !== rawTop,
        height: top - bottom,
        originX: rawLeft,
        originY: rawBottom,
        rawHeight: rawTop - rawBottom,
        rawWidth: rawRight - rawLeft,
        width: right - left,
        x: left,
        y: bottom,
      };
    }

    return { height: 0, offscreen: true, width: 0, x: 0, y: 0 };
  }

  return null;
};
