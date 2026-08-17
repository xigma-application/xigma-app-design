// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCornerRadiusHandles } from 'utils/canvas/drawCornerRadiusHandles';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { hasCornerRadius } from 'utils/canvas/cornerRadius/hasCornerRadius';
import { shouldShowCornerRadiusHandles } from 'utils/canvas/cornerRadius/shouldShowCornerRadiusHandles';

export const drawCornerRadiusHandlesLayer = (
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

  if (selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id && hasCornerRadius(selectedNode)) {
    const bounds = getNodeBounds(selectedNode);

    if (shouldShowCornerRadiusHandles(bounds, viewport)) {
      drawCornerRadiusHandles(
        gl,
        program,
        buffer,
        bounds,
        selectedNode.cornerRadius ?? 0,
        DRAFT_FRAME_STROKE,
        canvasWidth,
        canvasHeight,
        viewport,
        selectedNode.rotation,
      );
    }
  }
};
