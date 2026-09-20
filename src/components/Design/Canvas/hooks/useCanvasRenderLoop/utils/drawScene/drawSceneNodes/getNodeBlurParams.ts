// types
import { EffectType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TProgressiveBlurUniforms } from '../drawBoxLeafNode/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getLayerBlurRadius } from './getLayerBlurRadius';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getNodeEffectOfType } from './getNodeEffectOfType';
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { getProgressiveBlurLine } from './getProgressiveBlurLine';
import { isProgressiveBlur } from 'utils/design/effects/isProgressiveBlur';

export type TNodeBlurParams = { progressive?: TProgressiveBlurUniforms; radius: number };

export const getNodeBlurParams = (
  renderer: TMaskRenderer,
  node: TSceneNode,
  type: EffectType.backgroundBlur | EffectType.layerBlur,
): TNodeBlurParams | null => {
  const effect = getNodeEffectOfType(node, type);

  if (effect && isProgressiveBlur(effect)) {
    const progressive = getProgressiveBlur(effect);
    const radii: [number, number] = [
      getLayerBlurRadius(renderer, progressive.startBlur),
      getLayerBlurRadius(renderer, progressive.endBlur),
    ];

    return {
      progressive: {
        line: getProgressiveBlurLine(renderer, getNodeBounds(node), 'rotation' in node ? node.rotation : 0, progressive),
        radii,
      },
      radius: Math.max(...radii),
    };
  }

  if (effect) {
    return { radius: getLayerBlurRadius(renderer, effect.blur) };
  }

  return null;
};
