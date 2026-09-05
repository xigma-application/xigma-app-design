// types
import { TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';

const cache = new WeakMap<TVectorNode, TVectorNode>();

export const getRenderedVectorNode = (node: TVectorNode): TVectorNode => {
  if (node.rotation) {
    const cached = cache.get(node);

    if (!cached) {
      const renderedNode: TVectorNode = { ...node, ...bakeVectorNodeRotation(node) };
      cache.set(node, renderedNode);

      return renderedNode;
    }

    return cached;
  }

  return node;
};
