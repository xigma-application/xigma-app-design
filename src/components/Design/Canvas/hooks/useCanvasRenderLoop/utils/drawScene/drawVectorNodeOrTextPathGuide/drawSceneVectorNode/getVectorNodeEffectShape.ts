// types
import { TBooleanShape } from '../../drawBooleanLeafNode/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getDrawnVectorNode } from 'utils/canvas/render/getDrawnVectorNode';
import { getVectorEffectLayers } from 'utils/canvas/vector/effects/getVectorEffectLayers';
import { getVectorEffectShape } from './getVectorEffectShape';

const cache = new WeakMap<TVectorNode, TBooleanShape>();

export const getVectorNodeEffectShape = (node: TVectorNode): TBooleanShape => {
  const cached = cache.get(node);

  if (!cached) {
    const shape = getVectorEffectShape(getVectorEffectLayers(getDrawnVectorNode(node)));

    cache.set(node, shape);
    return shape;
  }

  return cached;
};
