// others
import { CONTACT_GUIDE_STROKE, CONTACT_GUIDE_X_MARKER_SIZE_PX } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TShapeContactGuide } from 'components/Design/Canvas/utils/getShapeContactGuides';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawXMarker } from 'utils/canvas/drawXMarker';

const drawContactGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  guide: TShapeContactGuide,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const strokeWidth = 1 / viewport.zoom;
  const markerHalfSize = CONTACT_GUIDE_X_MARKER_SIZE_PX / viewport.zoom;

  drawLine(gl, program, buffer, guide, CONTACT_GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport);
  drawXMarker(
    gl,
    program,
    buffer,
    { x: guide.x1, y: guide.y1 },
    markerHalfSize,
    CONTACT_GUIDE_STROKE,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawXMarker(
    gl,
    program,
    buffer,
    { x: guide.x2, y: guide.y2 },
    markerHalfSize,
    CONTACT_GUIDE_STROKE,
    strokeWidth,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};

export const drawShapeContactGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  refs.transform.contactGuidesRef.current?.forEach((guide) =>
    drawContactGuide(gl, program, buffer, guide, canvasWidth, canvasHeight, viewport),
  );
};
