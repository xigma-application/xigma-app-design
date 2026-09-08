// types
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawConstraintGuideCentreMarker } from './drawConstraintGuideCentreMarker';
import { drawConstraintGuideLines } from './drawConstraintGuideLines';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isConstraintEligibleFrameChild } from 'utils/canvas/signals/isConstraintEligibleFrameChild';

export const drawConstraintGuides = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): void => {
  if (selectedNodes.length === 1) {
    const node = selectedNodes[0];
    const parent = node.parentId ? nodesById[node.parentId] : undefined;

    if (parent && isBoxSceneNode(parent) && isBoxSceneNode(node) && isConstraintEligibleFrameChild(node, nodesById)) {
      drawConstraintGuideLines(context, node, parent);
      drawConstraintGuideCentreMarker(context, node, parent);
    }
  }
};
