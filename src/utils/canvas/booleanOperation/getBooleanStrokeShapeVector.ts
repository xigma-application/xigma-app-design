// types
import { TLineNode, TVectorNode } from 'types/design/types';

// utils
import { getNodeStrokeOutline } from '../vectorNetwork/getNodeStrokeOutline/getNodeStrokeOutline';
import { getDrawnVectorNode } from '../render/getDrawnVectorNode';

const cache = new WeakMap<TLineNode | TVectorNode, TVectorNode | null>();

export const getBooleanStrokeShapeVector = (node: TLineNode | TVectorNode): TVectorNode | null => {
  if (!cache.has(node)) {
    const outline = getNodeStrokeOutline(node);
    cache.set(node, outline ? getDrawnVectorNode(outline) : null);
  }

  return cache.get(node) ?? null;
};
