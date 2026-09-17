// others
import {
  DRAFT_FRAME_STROKE,
  IMAGE_EDITOR_OUTLINE_DASH_GAP_PX,
  IMAGE_EDITOR_OUTLINE_DASH_LENGTH_PX,
  SIZE_LABEL_FILL,
} from 'constant/canvas';

// types
import { TImageCrop } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawDashedRectOutline } from 'utils/canvas/drawDashedRectOutline';
import { drawImageEditorCornerHandles } from './drawImageEditorCornerHandles';
import { drawImageEditorEdgeHandles } from './drawImageEditorEdgeHandles';

export const drawImageEditorFrameOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TImageCrop,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isActive: boolean,
): void => {
  const { height, rotation, width, x, y } = rect;

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

  if (isActive) {
    drawImageEditorCornerHandles(gl, program, buffer, rect, SIZE_LABEL_FILL, canvasWidth, canvasHeight, viewport, rotation);
    drawImageEditorEdgeHandles(gl, program, buffer, rect, SIZE_LABEL_FILL, canvasWidth, canvasHeight, viewport, rotation);
  }
};
