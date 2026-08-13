// others
import { DRAFT_FRAME_STROKE, HOVER_OUTLINE_WIDTH, LINE_HOVER_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawTextHoverUnderline } from './drawTextHoverUnderline';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';
import { drawThickOutline } from 'utils/canvas/drawThickOutline';
import { drawThickPolygonOutline } from 'utils/canvas/shapes/drawThickPolygonOutline';
import { drawThickStarOutline } from 'utils/canvas/shapes/drawThickStarOutline';

export const drawHoverOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  hoveredNode: TSceneNode | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (hoveredNode) {
    switch (hoveredNode.type) {
      case NodeType.ellipse:
        drawThickEllipseOutline(
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
        drawTextHoverUnderline(gl, program, buffer, hoveredNode, canvasWidth, canvasHeight, viewport);
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
