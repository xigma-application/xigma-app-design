// types
import { TBooleanNode } from 'types/design/types';
import { TBooleanShape } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawableBoxEffectType } from '../drawBoxLeafNode/getBoxEffectDrawer';
import { TDrawSceneContext } from '../types';

// utils
import { getBooleanEffectDrawer } from './getBooleanEffectDrawer';
import { getEffectBlendModePreview } from 'utils/canvas/blendMode/getEffectBlendModePreview';

export const drawBooleanEffects = (
  context: TDrawSceneContext,
  node: Pick<TBooleanNode, 'effects' | 'id'>,
  shape: TBooleanShape,
  opacity: number,
  refs: TCanvasRefs,
  effectType: TDrawableBoxEffectType,
): void => {
  if (node.effects && shape.polygons.length > 0) {
    const draw = getBooleanEffectDrawer(effectType);

    node.effects.forEach((effect, index) => {
      if (effect.visible !== false && effect.type === effectType) {
        draw(context, shape, effect, opacity, getEffectBlendModePreview(refs, node.id, index) ?? effect.blendMode);
      }
    });
  }
};
