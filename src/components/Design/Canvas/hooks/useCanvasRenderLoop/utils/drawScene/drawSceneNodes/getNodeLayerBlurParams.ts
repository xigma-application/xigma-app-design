// types
import { TMaskRenderer } from './types';
import { TProgressiveBlurUniforms } from '../drawBoxLeafNode/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getLayerBlurRadius } from './getLayerBlurRadius';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getNodeLayerBlurEffect } from './getNodeLayerBlurEffect';
import { getProgressiveBlur } from 'utils/design/effects/getProgressiveBlur';
import { getProgressiveBlurLine } from './getProgressiveBlurLine';
import { isProgressiveLayerBlur } from 'utils/design/effects/isProgressiveLayerBlur';

export type TNodeLayerBlurParams = { progressive?: TProgressiveBlurUniforms; radius: number };

export const getNodeLayerBlurParams = (renderer: TMaskRenderer, node: TSceneNode): TNodeLayerBlurParams | null => {
  const effect = getNodeLayerBlurEffect(node);

  if (effect && isProgressiveLayerBlur(effect)) {
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
