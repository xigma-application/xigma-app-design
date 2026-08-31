// others
import { DRAFT_FRAME_STROKE, ELLIPSE_DEFAULT_ARC_ANGLE, HOVER_OUTLINE_WIDTH, LINE_HOVER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawTextHoverOutline } from './drawTextHoverOutline';
import { drawThickEllipseNodeOutline } from 'utils/canvas/shapes/drawThickEllipseNodeOutline';
import { drawThickOutline } from 'utils/canvas/drawThickOutline/drawThickOutline';
import { drawThickPolygonOutline } from 'utils/canvas/shapes/drawThickPolygonOutline';
import { drawThickStarOutline } from 'utils/canvas/shapes/drawThickStarOutline';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';

export const drawHoverOutline = (
  context: TDrawSceneContext,
  hoveredNode: TSceneNode | null | undefined,
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  if (hoveredNode && !vectorEditingNodeIds.includes(hoveredNode.id)) {
    switch (hoveredNode.type) {
      case NodeType.ellipse:
        drawThickEllipseNodeOutline(
          gl,
          program,
          buffer,
          {
            ...hoveredNode,
            arcEndAngle: hoveredNode.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
            arcStartAngle: hoveredNode.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE,
          },
          DRAFT_FRAME_STROKE,
          HOVER_OUTLINE_WIDTH,
          canvasWidth,
          canvasHeight,
          viewport,
          hoveredNode.flipX ?? false,
          hoveredNode.flipY ?? false,
          hoveredNode.rotation,
        );
        break;
      case NodeType.polygon:
        drawThickPolygonOutline(
          gl,
          program,
          buffer,
          hoveredNode,
          DRAFT_FRAME_STROKE,
          HOVER_OUTLINE_WIDTH,
          canvasWidth,
          canvasHeight,
          viewport,
          hoveredNode.flipX,
          hoveredNode.flipY,
          hoveredNode.rotation,
        );
        break;
      case NodeType.star:
        drawThickStarOutline(
          gl,
          program,
          buffer,
          hoveredNode,
          DRAFT_FRAME_STROKE,
          HOVER_OUTLINE_WIDTH,
          canvasWidth,
          canvasHeight,
          viewport,
          hoveredNode.flipX,
          hoveredNode.flipY,
          hoveredNode.rotation,
        );
        break;
      case NodeType.line:
        drawLine(
          gl,
          program,
          buffer,
          hoveredNode,
          DRAFT_FRAME_STROKE,
          LINE_HOVER_STROKE_WIDTH / viewport.zoom,
          canvasWidth,
          canvasHeight,
          viewport,
        );
        break;
      case NodeType.text:
        drawTextHoverOutline(gl, program, buffer, hoveredNode, nodesById, canvasWidth, canvasHeight, viewport);
        break;
      case NodeType.vector:
        drawVectorStroke(
          gl,
          program,
          buffer,
          flattenVectorSegments(getRenderedVectorNode(hoveredNode)),
          DRAFT_FRAME_STROKE,
          HOVER_OUTLINE_WIDTH / viewport.zoom,
          canvasWidth,
          canvasHeight,
          viewport,
        );
        break;
      default:
        drawThickOutline(
          gl,
          program,
          buffer,
          hoveredNode,
          DRAFT_FRAME_STROKE,
          HOVER_OUTLINE_WIDTH,
          canvasWidth,
          canvasHeight,
          viewport,
          hoveredNode.rotation,
        );
    }
  }
};
