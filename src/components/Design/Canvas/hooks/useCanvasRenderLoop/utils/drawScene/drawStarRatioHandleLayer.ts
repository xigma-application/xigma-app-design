// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawStarRatioHandle } from 'utils/canvas/drawStarRatioHandle';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { shouldShowVertexCountHandle } from 'utils/canvas/vertexCount/shouldShowVertexCountHandle';

export const drawStarRatioHandleLayer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  hoveredNode: TSceneNode | null | undefined,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
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
