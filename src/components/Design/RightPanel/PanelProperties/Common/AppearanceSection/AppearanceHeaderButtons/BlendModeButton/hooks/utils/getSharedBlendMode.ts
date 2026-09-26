// types
import { BlendMode } from 'types/design/enums';
import { TOpacityPanelNode } from '../../../../types';

export const getSharedBlendMode = (nodes: TOpacityPanelNode[]): BlendMode | undefined => {
  const value = nodes[0]?.blendMode ?? BlendMode.passThrough;
  return nodes.every((node) => (node.blendMode ?? BlendMode.passThrough) === value) ? value : undefined;
};
