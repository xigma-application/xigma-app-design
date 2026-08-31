// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawStarRatioHandle } from 'utils/canvas/drawStarRatioHandle';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { shouldShowVertexCountHandle } from 'utils/canvas/vertexCount/shouldShowVertexCountHandle';

export const drawStarRatioHandleLayer = (
  context: TDrawSceneContext,
  hoveredNode: TSceneNode | null | undefined,
  selectedNodes: TSceneNode[],
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const [selectedNode] = selectedNodes;

  if (selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id && selectedNode.type === NodeType.star) {
    const bounds = getNodeBounds(selectedNode);

    if (shouldShowVertexCountHandle(bounds, viewport)) {
      drawStarRatioHandle(
        gl,
        program,
        buffer,
        bounds,
        selectedNode.points,
        selectedNode.ratio,
        selectedNode.cornerRadius ?? 0,
        DRAFT_FRAME_STROKE,
        canvasWidth,
        canvasHeight,
        viewport,
        selectedNode.rotation,
        selectedNode.flipX,
        selectedNode.flipY,
      );
    }
  }
};
