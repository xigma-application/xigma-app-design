// types
import { TDrawSceneContext } from '../types';
import { TEffect, TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawNoiseMask } from './drawNoiseMask';
import { drawNoisePolygon } from './drawNoisePolygon';
import { getBoxFillPolygon } from '../getBoxFillPolygon';
import { getNoiseShapePoints } from './getNoiseShapePoints';
import { hasNoiseStroke } from './hasNoiseStroke';

export const drawNoiseShape = (context: TDrawSceneContext, node: TFrameNode | TRectangleNode, effect: TEffect, opacity: number): void => {
  const mask = hasNoiseStroke(node) ? drawNoiseMask(context, node) : null;

  drawNoisePolygon(
    context,
    effect,
    opacity,
    mask ? getNoiseShapePoints(node) : getBoxFillPolygon(node),
    { x: node.x + node.width / 2, y: node.y + node.height / 2 },
    node.rotation,
    mask,
  );
};
