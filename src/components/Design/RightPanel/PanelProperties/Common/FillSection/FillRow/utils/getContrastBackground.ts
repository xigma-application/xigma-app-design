// types
import { TContrastBackground } from '../types';
import { TSceneNode } from 'types/design/types';
import { TSolidPaint } from 'types/design/paint/types';

// utils
import { getAncestorChain } from 'store/design/utils/nodeHierarchy/getAncestorChain';
import { isBlendModeActive } from 'utils/design/paint/isBlendModeActive';
import { resolveContrastBackground } from './resolveContrastBackground';

const hasAppearanceBlendMode = (node: TSceneNode): boolean => 'blendMode' in node && isBlendModeActive(node.blendMode);

export const getContrastBackground = (
  nodeId: string | undefined,
  nodesById: Record<string, TSceneNode>,
  pageBackground: TSolidPaint,
): TContrastBackground => {
  const node = nodeId ? nodesById[nodeId] : undefined;
  const ancestors = node ? getAncestorChain(node, nodesById) : [];

  return ancestors.some(hasAppearanceBlendMode)
    ? { reason: 'backgroundBlendMode' }
    : resolveContrastBackground(ancestors, pageBackground);
};
