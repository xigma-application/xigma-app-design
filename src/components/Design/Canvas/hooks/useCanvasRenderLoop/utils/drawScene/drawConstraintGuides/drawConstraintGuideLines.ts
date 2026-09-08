// others
import { CONSTRAINT_GUIDE_DASH_GAP_PX, CONSTRAINT_GUIDE_DASH_LENGTH_PX, CONSTRAINT_GUIDE_STROKE } from 'constant/canvas';

// types
import { TBoxSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawDashedLine } from 'utils/canvas/drawDashedLine';
import { getConstraintGuideSegments } from './getConstraintGuideSegments/getConstraintGuideSegments';

export const drawConstraintGuideLines = (context: TDrawSceneContext, node: TBoxSceneNode, parent: TBoxSceneNode): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const strokeWidth = 1 / viewport.zoom;

  getConstraintGuideSegments(node, parent, node.alignment).forEach((segment) => {
    drawDashedLine(
      gl,
      program,
      buffer,
      segment,
      CONSTRAINT_GUIDE_STROKE,
      strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      CONSTRAINT_GUIDE_DASH_LENGTH_PX,
      CONSTRAINT_GUIDE_DASH_GAP_PX,
    );
  });
};
