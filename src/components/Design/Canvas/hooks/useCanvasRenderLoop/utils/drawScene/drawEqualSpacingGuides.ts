// others
import { EQUAL_SPACING_GUIDE_LABEL_FILL, EQUAL_SPACING_GUIDE_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDistanceGuideLine } from 'components/Design/Canvas/utils/getDistanceGuides/types';
import { TDrawSceneContext } from './types';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

const drawEqualSpacingGuideLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  line: TDistanceGuideLine,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawLine(gl, program, buffer, line, EQUAL_SPACING_GUIDE_STROKE, 1 / viewport.zoom, canvasWidth, canvasHeight, viewport);
};

export const drawEqualSpacingGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const guides = refs.transform.equalSpacingGuidesRef.current;

  if (guides) {
    guides.lines.forEach((line) => drawEqualSpacingGuideLine(gl, program, buffer, line, canvasWidth, canvasHeight, viewport));
    guides.labels.forEach((label) =>
      drawValueLabel(
        gl,
        program,
        buffer,
        imageContext,
        label.text,
        label.anchor,
        label.offsetDirection,
        canvasWidth,
        canvasHeight,
        viewport,
        {
          fill: EQUAL_SPACING_GUIDE_LABEL_FILL,
        },
      ),
    );
  }
};
