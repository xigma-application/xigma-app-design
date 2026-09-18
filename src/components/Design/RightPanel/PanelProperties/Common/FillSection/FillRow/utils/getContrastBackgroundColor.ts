// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getAncestorChain } from 'store/design/utils/nodeHierarchy/getAncestorChain';
import { getEffectiveFillColor } from 'utils/design/paint/getEffectiveFillColor';

const getAncestorFillColor = (node: TSceneNode): string | null => {
  if ('fills' in node) {
    return getEffectiveFillColor(node.fills);
  }

  return node.type === NodeType.section ? node.fill : null;
};

export const getContrastBackgroundColor = (
  nodeId: string | undefined,
  nodesById: Record<string, TSceneNode>,
  pageBackgroundColor: string,
): string => {
  const node = nodeId ? nodesById[nodeId] : undefined;
  const ancestors = node ? getAncestorChain(node, nodesById) : [];
  const resolvedColor = ancestors.map(getAncestorFillColor).find((color) => color !== null);

  return resolvedColor ?? pageBackgroundColor;
};
