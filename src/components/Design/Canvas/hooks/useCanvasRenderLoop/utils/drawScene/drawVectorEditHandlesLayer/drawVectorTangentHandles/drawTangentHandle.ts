// others
import { VECTOR_EDGE_HOVER_STROKE, VECTOR_EDIT_OUTLINE_STROKE, VECTOR_HANDLE_FILL, VECTOR_HANDLE_HOVER_STROKE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawDefaultTangentHandleDot } from './drawDefaultTangentHandleDot';
import { drawLine } from 'utils/canvas/drawLine';
import { drawSelectedTangentHandleDot } from './drawSelectedTangentHandleDot';

const getTangentHandleLineStroke = (isHovered: boolean, isSelected: boolean, isSnapped: boolean): string => {
  switch (true) {
    case isSnapped:
      return VECTOR_EDGE_HOVER_STROKE;
    case isSelected:
      return VECTOR_HANDLE_FILL;
    case isHovered:
      return VECTOR_HANDLE_HOVER_STROKE;
    default:
      return VECTOR_EDIT_OUTLINE_STROKE;
  }
};

export const drawTangentHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TPoint,
  handle: TPoint,
  dotSize: number,
  isHovered: boolean,
  isSelected: boolean,
  isSnapped: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawLine(
    gl,
    program,
    buffer,
    { x1: vertex.x, x2: handle.x, y1: vertex.y, y2: handle.y },
    getTangentHandleLineStroke(isHovered, isSelected, isSnapped),
    1 / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );

  if (isSelected) {
    drawSelectedTangentHandleDot(gl, program, buffer, handle, dotSize, canvasWidth, canvasHeight, viewport);
  } else {
    drawDefaultTangentHandleDot(gl, program, buffer, handle, dotSize, isHovered, canvasWidth, canvasHeight, viewport);
  }
};
