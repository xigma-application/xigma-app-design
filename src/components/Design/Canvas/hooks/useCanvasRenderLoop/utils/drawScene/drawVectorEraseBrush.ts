// others
import { VECTOR_EDIT_OUTLINE_STROKE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { ToolName } from 'types/design/enums';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawVectorEraseBrush = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  brushCenter: TPoint | null,
  diameterPx: number,
  activeTool: ToolName,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (activeTool === ToolName.erase && brushCenter) {
    const radius = diameterPx / 2 / viewport.zoom;

    drawEllipse(
      gl,
      program,
      buffer,
      { height: radius * 2, stroke: VECTOR_EDIT_OUTLINE_STROKE, width: radius * 2, x: brushCenter.x - radius, y: brushCenter.y - radius },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  }
};
