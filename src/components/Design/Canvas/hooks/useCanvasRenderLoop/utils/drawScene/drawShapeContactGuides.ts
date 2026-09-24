import { CONTACT_GUIDE_STROKE, CONTACT_GUIDE_X_MARKER_SIZE_PX } from 'constant/canvas';

import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TLineSegment } from 'types/canvas';
import { TShapeContactGuide } from 'components/Design/Canvas/utils/getShapeContactGuides';

import { drawLineBatch } from 'utils/canvas/drawLineBatch';
import { getXMarkerSegments } from 'utils/canvas/getXMarkerSegments';

const getContactGuideSegments = (guide: TShapeContactGuide, markerHalfSize: number): TLineSegment[] => [
  guide,
  ...getXMarkerSegments({ x: guide.x1, y: guide.y1 }, markerHalfSize),
  ...getXMarkerSegments({ x: guide.x2, y: guide.y2 }, markerHalfSize),
];

export const drawShapeContactGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const guides = refs.transform.contactGuidesRef.current;

  if (guides) {
    const markerHalfSize = CONTACT_GUIDE_X_MARKER_SIZE_PX / viewport.zoom;

    drawLineBatch(
      gl,
      program,
      buffer,
      guides.flatMap((guide) => getContactGuideSegments(guide, markerHalfSize)),
      CONTACT_GUIDE_STROKE,
      1 / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
