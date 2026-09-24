// types
import { TLineNode, TVectorNode } from 'types/design/types';

// utils
import { getNodeStrokeOutline } from '../vectorNetwork/getNodeStrokeOutline/getNodeStrokeOutline';
import { getRenderedVectorNode } from '../render/getRenderedVectorNode';

const cache = new WeakMap<TLineNode | TVectorNode, TVectorNode | null>();

export const getBooleanStrokeShapeVector = (node: TLineNode | TVectorNode): TVectorNode | null => {
  if (!cache.has(node)) {
    const outline = getNodeStrokeOutline(node);
    cache.set(node, outline ? getRenderedVectorNode(outline) : null);
  }

  return cache.get(node) ?? null;
};
