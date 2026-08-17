// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TPolygonNode, TRectangleNode, TSceneNode, TStarNode, TViewport } from 'types/design/types';

// utils
import { drawCornerRadiusHandles } from 'utils/canvas/drawCornerRadiusHandles';
import { drawPolygonCornerRadiusHandle } from 'utils/canvas/drawPolygonCornerRadiusHandle';
import { drawStarCornerRadiusHandle } from 'utils/canvas/drawStarCornerRadiusHandle';
import { getNodeBounds } from '../../../../utils/getNodeBounds';
import { hasCornerRadius } from 'utils/canvas/cornerRadius/hasCornerRadius';
import { hasPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/hasPolygonCornerRadius';
import { hasStarCornerRadius } from 'utils/canvas/cornerRadius/star/hasStarCornerRadius';
import { shouldShowCornerRadiusHandles } from 'utils/canvas/cornerRadius/shouldShowCornerRadiusHandles';

const hasAnyCornerRadius = (node: TSceneNode): node is TRectangleNode | TPolygonNode | TStarNode =>
  hasCornerRadius(node) || hasPolygonCornerRadius(node) || hasStarCornerRadius(node);

export const drawCornerRadiusHandlesLayer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  hoveredNode: TSceneNode | null | undefined,
  selectedNodes: TSceneNode[],
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isDraggingCornerRadius = false,
): void => {
  const [selectedNode] = selectedNodes;

  if (selectedNodes.length === 1 && hoveredNode?.id === selectedNode.id && hasAnyCornerRadius(selectedNode)) {
    const bounds = getNodeBounds(selectedNode);
    const cornerRadius = selectedNode.cornerRadius ?? 0;
    const canShowHandles = shouldShowCornerRadiusHandles(bounds, viewport, cornerRadius, isDraggingCornerRadius);

    // eslint-disable-next-line default-case -- hasAnyCornerRadius already guarantees one of the cases below matches, so a default arm would be dead code unreachable by any test
    switch (true) {
      case !canShowHandles:
        break;
      case hasCornerRadius(selectedNode):
        drawCornerRadiusHandles(
          gl,
          program,
          buffer,
          bounds,
          cornerRadius,
          DRAFT_FRAME_STROKE,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          isDraggingCornerRadius,
        );
        break;
      case hasPolygonCornerRadius(selectedNode):
        drawPolygonCornerRadiusHandle(
          gl,
          program,
          buffer,
          bounds,
          selectedNode.sides,
          cornerRadius,
          DRAFT_FRAME_STROKE,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
          isDraggingCornerRadius,
        );
        break;
      case hasStarCornerRadius(selectedNode):
        drawStarCornerRadiusHandle(
          gl,
          program,
          buffer,
          bounds,
          selectedNode.points,
          selectedNode.ratio,
          cornerRadius,
          DRAFT_FRAME_STROKE,
          canvasWidth,
          canvasHeight,
          viewport,
          selectedNode.rotation,
          selectedNode.flipX,
          selectedNode.flipY,
          isDraggingCornerRadius,
        );
        break;
    }
  }
};
