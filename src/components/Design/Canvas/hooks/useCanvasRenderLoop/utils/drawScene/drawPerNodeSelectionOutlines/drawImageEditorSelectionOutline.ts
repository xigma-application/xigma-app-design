// others
import { DRAFT_FRAME_STROKE, IMAGE_EDITOR_OUTLINE_DASH_GAP_PX, IMAGE_EDITOR_OUTLINE_DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TBoxSceneNode, TPathNode, TViewport } from 'types/design/types';

// utils
import { drawCornerHandles } from 'utils/canvas/drawCornerHandles';
import { drawDashedRectOutline } from 'utils/canvas/drawDashedRectOutline';
import { drawEdgeMidpointHandles } from 'utils/canvas/drawEdgeMidpointHandles';

export const drawImageEditorSelectionOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: Exclude<TBoxSceneNode, TPathNode>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const { height, rotation, width, x, y } = node;

  drawDashedRectOutline(
    gl,
    program,
    buffer,
    { height, width, x, y },
    DRAFT_FRAME_STROKE,
    canvasWidth,
    canvasHeight,
    viewport,
    rotation,
    IMAGE_EDITOR_OUTLINE_DASH_LENGTH_PX,
    IMAGE_EDITOR_OUTLINE_DASH_GAP_PX,
  );
  drawCornerHandles(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
  drawEdgeMidpointHandles(gl, program, buffer, node, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport, rotation);
};
