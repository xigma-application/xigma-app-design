// others
import { DRAFT_FRAME_STROKE, LINE_SELECTED_STROKE_WIDTH } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { drawLine } from 'utils/canvas/drawLine';
import { drawLineEndpointHandles } from 'utils/canvas/drawLineEndpointHandles';

export const drawLineSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Extract<TSceneNode, { type: NodeType.line }>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const points = getLinePoints(node);

  drawLine(
    gl,
    program,
    buffer,
    points,
    DRAFT_FRAME_STROKE,
    LINE_SELECTED_STROKE_WIDTH / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawLineEndpointHandles(
    gl,
    program,
    buffer,
    [
      { x: points.x1, y: points.y1 },
      { x: points.x2, y: points.y2 },
    ],
    DRAFT_FRAME_STROKE,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
