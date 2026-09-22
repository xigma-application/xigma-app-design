// types
import { TSceneNode } from 'types/design/types';

const sanitizeSvgId = (name: string): string => {
  const cleaned = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  return /^[a-zA-Z_]/.test(cleaned) ? cleaned : `_${cleaned}`;
};

export const getSvgElementId = (node: TSceneNode, usedIds: Map<string, number>): string => {
  const base = sanitizeSvgId(node.name);
  const count = usedIds.get(base) ?? 0;

  usedIds.set(base, count + 1);

  return count === 0 ? base : `${base}_${count + 1}`;
};
