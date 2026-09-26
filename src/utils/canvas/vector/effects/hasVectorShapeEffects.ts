// others
import { VECTOR_SHAPE_EFFECT_TYPES } from './constants';

// types
import { TVectorNode } from 'types/design/types';

export const hasVectorShapeEffects = (node: Pick<TVectorNode, 'effects'>): boolean =>
  (node.effects ?? []).some((effect) => effect.visible !== false && VECTOR_SHAPE_EFFECT_TYPES.includes(effect.type));
