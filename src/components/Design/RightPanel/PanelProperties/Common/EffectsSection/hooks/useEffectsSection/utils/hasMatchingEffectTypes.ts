// types
import { TAppearanceNode } from '../../../../AppearanceSection/types';

export const hasMatchingEffectTypes = (nodes: TAppearanceNode[]): boolean => {
  const types = (nodes[0]?.effects ?? []).map((effect) => effect.type);

  return nodes.every(
    (node) => (node.effects ?? []).length === types.length && (node.effects ?? []).every((effect, index) => effect.type === types[index]),
  );
};
