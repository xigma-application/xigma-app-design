// others
import { CONSTRAINT_GUIDE_DASH_GAP_PX, CONSTRAINT_GUIDE_DASH_LENGTH_PX, CONSTRAINT_GUIDE_STROKE } from 'constant/canvas';

// types
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawDashedLine } from 'utils/canvas/drawDashedLine';
import { getConstraintGuideSegments } from './getConstraintGuideSegments/getConstraintGuideSegments';
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
      const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

      getConstraintGuideSegments(node, parent, node.alignment).forEach((segment) => {
        drawDashedLine(
          gl,
          program,
          buffer,
          segment,
          CONSTRAINT_GUIDE_STROKE,
          1 / viewport.zoom,
          canvasWidth,
          canvasHeight,
          viewport,
          CONSTRAINT_GUIDE_DASH_LENGTH_PX,
          CONSTRAINT_GUIDE_DASH_GAP_PX,
        );
      });
    }
  }
};
