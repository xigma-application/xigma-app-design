// others
import { VECTOR_CUT_LINE_STROKE, VECTOR_CUT_LINE_STROKE_WIDTH } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawVectorCutPointMarker } from './drawVectorCutPointMarker';

export const drawVectorCutPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const preview = refs.vectorCut.vectorCutPreviewRef.current;

  if (preview) {
    drawLine(
      gl,
      program,
      buffer,
      { x1: preview.lineStart.x, x2: preview.lineEnd.x, y1: preview.lineStart.y, y2: preview.lineEnd.y },
      VECTOR_CUT_LINE_STROKE,
      VECTOR_CUT_LINE_STROKE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );

    preview.crossings.forEach((crossing) => {
      drawVectorCutPointMarker(gl, program, buffer, crossing.point, canvasWidth, canvasHeight, viewport);
    });
  }
};
