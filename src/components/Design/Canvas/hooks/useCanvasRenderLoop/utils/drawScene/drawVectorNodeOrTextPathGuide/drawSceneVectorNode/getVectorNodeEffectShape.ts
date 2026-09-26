// types
import { TBooleanShape } from '../../drawBooleanLeafNode/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorEffectLayers } from 'utils/canvas/vector/effects/getVectorEffectLayers';
import { getVectorEffectShape } from './getVectorEffectShape';

const cache = new WeakMap<TVectorNode, TBooleanShape>();

export const getVectorNodeEffectShape = (node: TVectorNode): TBooleanShape => {
  const cached = cache.get(node);

  if (!cached) {
    const shape = getVectorEffectShape(getVectorEffectLayers(getRenderedVectorNode(node)));

    cache.set(node, shape);
    return shape;
  }

  return cached;
};
