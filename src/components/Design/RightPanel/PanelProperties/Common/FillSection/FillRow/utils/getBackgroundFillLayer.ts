// types
import { NodeType } from 'types/design/enums';
import { TBackgroundFillLayer } from '../types';
import { TPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getBackgroundPaintReason } from './getBackgroundPaintReason';
import { isBlendModeActive } from 'utils/design/paint/isBlendModeActive';

const pickDominantPaint = (fills: TPaint[]): TPaint | undefined =>
  fills
    .filter((paint) => paint.visible !== false && paint.opacity > 0)
    .reduce<TPaint | undefined>((dominant, paint) => (dominant && dominant.opacity >= paint.opacity ? dominant : paint), undefined);

const getPaintLayer = (paint: TPaint): TBackgroundFillLayer => {
  if (!isBlendModeActive(paint.blendMode)) {
    switch (paint.type) {
      case 'solid':
        return { alpha: paint.opacity / 100, color: paint.color, kind: 'solid' };
      default:
        return { kind: 'unsupported', reason: getBackgroundPaintReason(paint) };
    }
  }

  return { kind: 'unsupported', reason: 'backgroundBlendMode' };
};

export const getBackgroundFillLayer = (node: TSceneNode): TBackgroundFillLayer => {
  if ('fills' in node) {
    const paint = pickDominantPaint(node.fills);

    if (paint) {
      return getPaintLayer(paint);
    }
  }

  if (node.type === NodeType.section) {
    return { alpha: 1, color: node.fill, kind: 'solid' };
  }

  return { kind: 'none' };
};
