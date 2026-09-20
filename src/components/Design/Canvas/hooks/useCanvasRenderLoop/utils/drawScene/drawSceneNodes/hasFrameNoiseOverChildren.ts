// types
import { EffectType, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const hasFrameNoiseOverChildren = (node: TSceneNode): boolean =>
  node.type === NodeType.frame &&
  node.childIds.length > 0 &&
  (node.effects ?? []).some((effect) => effect.type === EffectType.noise && effect.visible !== false);
