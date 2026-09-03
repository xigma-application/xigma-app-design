// others
import {
  SMART_SELECTION_GAP_HANDLE_STROKE,
  SMART_SELECTION_SWAP_HANDLE_CORE_SIZE_PX,
  SMART_SELECTION_SWAP_HANDLE_FILL,
  SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX,
} from 'constant/canvas';

// types
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

const drawCentredCircle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  centerX: number,
  centerY: number,
  diameter: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawEllipse(
    gl,
    program,
    buffer,
    { fill, height: diameter, width: diameter, x: centerX - diameter / 2, y: centerY - diameter / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};

export const drawSwapHandleDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  centerX: number,
  centerY: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const outline = SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX / viewport.zoom;
  const core = SMART_SELECTION_SWAP_HANDLE_CORE_SIZE_PX / viewport.zoom;

  drawCentredCircle(gl, program, buffer, centerX, centerY, outline, SMART_SELECTION_GAP_HANDLE_STROKE, canvasWidth, canvasHeight, viewport);
  drawCentredCircle(gl, program, buffer, centerX, centerY, core, SMART_SELECTION_SWAP_HANDLE_FILL, canvasWidth, canvasHeight, viewport);
};
