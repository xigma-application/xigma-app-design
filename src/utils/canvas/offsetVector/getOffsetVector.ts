// types
import { NodeType, StrokeJoin } from 'types/design/enums';
import { TOffsetVectorNode } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { getLineOffsetVector } from '../line/getLineOffsetVector';
import { getPolygonOffsetVector } from './getPolygonOffsetVector';

type TCachedOffsetVector = { distance: number; join: StrokeJoin; vector: TVectorNode };

const cache = new WeakMap<TOffsetVectorNode, TCachedOffsetVector>();

const computeOffsetVector = (node: TOffsetVectorNode, distance: number, join: StrokeJoin): TVectorNode => {
  switch (node.type) {
    case NodeType.line:
      return { ...getLineOffsetVector(node, distance, join), id: node.id };
    case NodeType.polygon:
      return getPolygonOffsetVector(node, distance, join);
    // no default
  }
};

export const getOffsetVector = (node: TOffsetVectorNode, distance: number, join: StrokeJoin): TVectorNode => {
  const cached = cache.get(node);

  if (cached?.distance !== distance || cached.join !== join) {
    const vector = computeOffsetVector(node, distance, join);
    cache.set(node, { distance, join, vector });

    return vector;
  }

  return cached.vector;
};
