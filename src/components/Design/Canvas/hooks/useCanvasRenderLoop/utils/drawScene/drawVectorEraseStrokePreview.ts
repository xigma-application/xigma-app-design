// others
import { BACKGROUND_COLOR } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { ToolName } from 'types/design/enums';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';

export const drawVectorEraseStrokePreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  strokePath: TPoint[] | null,
  diameterPx: number,
  activeTool: ToolName,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (activeTool === ToolName.erase && strokePath && strokePath.length > 0) {
    const radius = diameterPx / 2 / viewport.zoom;

    if (strokePath.length > 1) {
      drawVectorStroke(
        gl,
        program,
        buffer,
        [{ endId: '', points: strokePath, segmentId: '', startId: '' }],
        BACKGROUND_COLOR,
        radius * 2,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }

    [strokePath[0], strokePath[strokePath.length - 1]].forEach((point) => {
      drawEllipse(
        gl,
        program,
        buffer,
        { fill: BACKGROUND_COLOR, height: radius * 2, width: radius * 2, x: point.x - radius, y: point.y - radius },
        canvasWidth,
        canvasHeight,
        viewport,
        0,
      );
    });
  }
};
