// others
import { CONTACT_GUIDE_X_MARKER_SIZE_PX, DISTANCE_GUIDE_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { drawXMarker } from 'utils/canvas/drawXMarker';

export const drawMatchedPairGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
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
  }
};
