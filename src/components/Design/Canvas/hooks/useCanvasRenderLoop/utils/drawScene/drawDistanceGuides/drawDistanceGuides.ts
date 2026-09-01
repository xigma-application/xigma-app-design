// others
import { DISTANCE_GUIDE_LABEL_FILL, DISTANCE_GUIDE_LABEL_GAP_PX } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawDistanceGuideLine } from './drawDistanceGuideLine';
import { drawDistanceGuideOutlines } from './drawDistanceGuideOutlines';
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

export const drawDistanceGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const guides = refs.transform.distanceGuidesRef.current;

  if (guides) {
    drawDistanceGuideOutlines(gl, program, buffer, guides, canvasWidth, canvasHeight, viewport);
    guides.lines.forEach((line) => drawDistanceGuideLine(gl, program, buffer, line, canvasWidth, canvasHeight, viewport));
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
          edgeGapPx: DISTANCE_GUIDE_LABEL_GAP_PX,
          fill: DISTANCE_GUIDE_LABEL_FILL,
        },
      ),
    );
  }
};
