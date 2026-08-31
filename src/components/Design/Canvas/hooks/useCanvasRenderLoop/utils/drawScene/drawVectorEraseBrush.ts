// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';
import { ToolName } from 'types/design/enums';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';

export const drawVectorEraseBrush = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  activeTool: ToolName,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const brushCenter = refs.vectorErase.eraseBrushCenterRef.current;
  const diameterPx = refs.vectorErase.eraserDiameterRef.current;

  if (activeTool === ToolName.erase && brushCenter) {
    const radius = diameterPx / 2 / viewport.zoom;

    drawEllipse(
      gl,
      program,
      buffer,
      { height: radius * 2, stroke: DRAFT_FRAME_STROKE, width: radius * 2, x: brushCenter.x - radius, y: brushCenter.y - radius },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  }
};
