// others
import { CONSTRAINT_GUIDE_CENTRE_DOT_SIZE_PX, CONSTRAINT_GUIDE_CENTRE_MARKER_HALF_SIZE_PX, CONSTRAINT_GUIDE_STROKE } from 'constant/canvas';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TBoxSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawVertexDot } from '../drawVectorEditHandlesLayer/drawVectorVertexDots/drawVertexDot';
import { drawXMarker } from 'utils/canvas/drawXMarker';
import { getConstraintGuideCentre } from './getConstraintGuideSegments/getConstraintGuideCentre';

export const drawConstraintGuideCentreMarker = (context: TDrawSceneContext, node: TBoxSceneNode, parent: TBoxSceneNode): void => {
  const hasCentreConstraint =
    node.alignment?.horizontal === AlignmentHorizontal.center || node.alignment?.vertical === AlignmentVertical.center;

  if (hasCentreConstraint) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const strokeWidth = 1 / viewport.zoom;
    const centre = getConstraintGuideCentre(node, parent);

    drawXMarker(
      gl,
      program,
      buffer,
      centre,
      CONSTRAINT_GUIDE_CENTRE_MARKER_HALF_SIZE_PX / viewport.zoom,
      CONSTRAINT_GUIDE_STROKE,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawVertexDot(
      gl,
      program,
      buffer,
      centre.x,
      centre.y,
      CONSTRAINT_GUIDE_CENTRE_DOT_SIZE_PX / viewport.zoom,
      CONSTRAINT_GUIDE_STROKE,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
