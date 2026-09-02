// others
import {
  CONTACT_GUIDE_X_MARKER_SIZE_PX,
  DISTANCE_GUIDE_LABEL_FILL,
  DISTANCE_GUIDE_LABEL_GAP_PX,
  DISTANCE_GUIDE_STROKE,
} from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';
import { drawXMarker } from 'utils/canvas/drawXMarker';

export const drawMatchedPairGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const guides = refs.transform.matchedPairGuidesRef.current;

  if (guides) {
    const strokeWidth = 1 / viewport.zoom;
    const markerHalfSize = CONTACT_GUIDE_X_MARKER_SIZE_PX / viewport.zoom;

    guides.lines.forEach((line) =>
      drawLine(gl, program, buffer, line, DISTANCE_GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport),
    );
    guides.markers.forEach((marker) =>
      drawXMarker(gl, program, buffer, marker, markerHalfSize, DISTANCE_GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport),
    );
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
        { edgeGapPx: DISTANCE_GUIDE_LABEL_GAP_PX, fill: DISTANCE_GUIDE_LABEL_FILL },
      ),
    );
  }
};
