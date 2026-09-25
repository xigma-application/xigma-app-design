// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getSectionNameLabelRects, isPointInSectionNameLabelRect } from '../../../../../utils/getSectionNameLabelRects';
import { isAncestorNode } from 'store/design/utils/nodeHierarchy/isAncestorNode';

export const getNestedSectionLabelHit = (
  frame: TSceneNode,
  point: TPoint,
  zoom: number,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): TSceneNode | null => {
  const sections = renderOrderedNodes.filter(
    (node) => node.type === NodeType.section && !node.hidden && !node.locked && isAncestorNode(frame.id, node, nodesById),
  );
  const rect = [...getSectionNameLabelRects(sections, zoom, nodesById)]
    .reverse()
    .find((candidate) => isPointInSectionNameLabelRect(point, candidate));

  return rect ? nodesById[rect.nodeId] : null;
};
