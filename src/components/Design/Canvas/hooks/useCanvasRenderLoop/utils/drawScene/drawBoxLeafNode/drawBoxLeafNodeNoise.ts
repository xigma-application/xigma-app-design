// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { drawBoxEffects } from './drawBoxEffects';

export const drawBoxLeafNodeNoise = (
  context: TDrawSceneContext,
  node: TFrameNode | TRectangleNode | TSectionNode,
  opacity: number,
  refs: TCanvasRefs,
): void => {
  if ('fills' in node) {
    drawBoxEffects(context, node, opacity, refs, EffectType.noise);
  }
};
