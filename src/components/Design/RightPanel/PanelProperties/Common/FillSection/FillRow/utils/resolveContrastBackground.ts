// types
import { TContrastBackground } from '../types';
import { TSceneNode } from 'types/design/types';
import { TSolidPaint } from 'types/design/paint/types';

// utils
import { blendHexColors } from 'utils/color/blendHexColors';
import { getBackgroundFillLayer } from './getBackgroundFillLayer';

export const resolveContrastBackground = (ancestors: TSceneNode[], pageBackground: TSolidPaint): TContrastBackground => {
  const [nearest, ...rest] = ancestors;

  if (nearest) {
    const layer = getBackgroundFillLayer(nearest);

    switch (layer.kind) {
      case 'none':
        return resolveContrastBackground(rest, pageBackground);
      case 'unsupported':
        return { reason: layer.reason };
      default: {
        if (layer.alpha >= 1) {
          return { color: layer.color };
        }

        const beneath = resolveContrastBackground(rest, pageBackground);

        return beneath.reason ? beneath : { color: blendHexColors(layer.color, beneath.color, layer.alpha) };
      }
    }
  }

  return pageBackground.visible === false || pageBackground.opacity <= 0 ? { reason: 'mixedBackground' } : { color: pageBackground.color };
};
