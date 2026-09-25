// types
import { EffectType } from 'types/design/enums';
import { TEffect, TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

export const getBoxEffectTextureKey = (type: EffectType, node: TFrameNode | TRectangleNode | TSectionNode, effect: TEffect): string =>
  [
    type,
    node.width,
    node.height,
    node.cornerRadius,
    node.cornerRadiusTopLeft,
    node.cornerRadiusTopRight,
    node.cornerRadiusBottomLeft,
    node.cornerRadiusBottomRight,
    node.cornerSmoothing,
    effect.color,
    effect.blur,
    effect.spread,
    effect.x,
    effect.y,
  ].join('|');
