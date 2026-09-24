// types
import { EffectType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDropShadowMargin } from '../drawBoxLeafNode/getDropShadowMargin';

const GLASS_REACH = 80;

export const getNodeChangeMargin = (node: TSceneNode): number => {
  const effects = 'effects' in node ? (node.effects ?? []) : [];
  const stroke = 'strokeWidth' in node ? (node.strokeWidth ?? 0) : 0;

  return (
    stroke +
    effects.reduce(
      (margin, effect) =>
        Math.max(
          margin,
          getDropShadowMargin(effect) + effect.blur + (effect.radius ?? 0) + (effect.type === EffectType.glass ? GLASS_REACH : 0),
        ),
      0,
    )
  );
};
