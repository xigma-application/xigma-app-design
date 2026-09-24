// types
import { BlendMode } from 'types/design/enums';
import { TAppearanceNode } from '../../../../types';

export const getSharedBlendMode = (nodes: TAppearanceNode[]): BlendMode | undefined => {
  const value = nodes[0]?.blendMode ?? BlendMode.passThrough;
  return nodes.every((node) => (node.blendMode ?? BlendMode.passThrough) === value) ? value : undefined;
};
