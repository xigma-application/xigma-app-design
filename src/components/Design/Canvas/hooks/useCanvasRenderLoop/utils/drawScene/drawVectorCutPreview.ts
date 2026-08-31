// others
import { VECTOR_CUT_LINE_STROKE, VECTOR_CUT_LINE_STROKE_WIDTH } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawVectorCutPointMarker } from './drawVectorCutPointMarker';

export const drawVectorCutPreview = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
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
